let selector = {};
init();

let pageClassificator = new NaiveBayes();
let pageDataset = new Dataset();


let collectors = [];
let currentCollector = {};
let currentDataset = null;
let currentPredictedElems = [];

let domain = document.location.host;
let url = document.location.href;

let rootModal = document.createElement("div");
const shadowRoot = rootModal.attachShadow({mode: 'open'});

document.body.appendChild(rootModal);

loadStartData(domain);

// starturl
function loadStartData(domain) {
    console.log("loadStartData");
    let work = domain  + "_work";
    console.log(work);
    chrome.storage.local.get(work, (data) => {
        if (data[work] === "yes") {
            console.log("loadStartData yes");
            console.log("LOAD DATA");
            createViewElemWindow(shadowRoot);
        }
    });
}

function init()
{
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("css/content.css");
    document.head.appendChild(link);
}

function addCollector(name, type) {
    currentCollector = new Collector(new Dataset(), new NaiveBayes());
    currentCollector.setName(name);
    currentCollector.setType(type);
    currentCollector.setURL(window.location.href);
    collectors.push(currentCollector);
    return currentCollector;
}

function addPageSample() {
    let isNewUrl = true;
    for (let collector of collectors) {
        if (collector.url === url) {
            isNewUrl = false;
        }
    }
    if (isNewUrl) {
        let sample = createCurPageSample(window.location.href);
        pageDataset.addTrainSample(sample);
        return sample;
    }
    return undefined;
}

function createCurPageSample(target) {
    let sample = {};
    sample.features = {};
    sample.target = target;
    sample.features.depth = calculateDOMDepth(document.documentElement);
    sample.features.avgDepth = calculateAverageNodeDepth(document.documentElement);
    // sample.features.tagFreq = calculateTagFrequency(document.documentElement);
    sample.features.hasForm = findForms();
    // sample.features.countImages = countImages();
    sample.features.title = document.title;
    sample.features.countLinks = countLinks(document.documentElement);
    sample.features.textAmount = calculateTextAmount();
    return sample;
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.message) {
        case "start":
            selectExtractor(shadowRoot);
            chrome.storage.local.set({[domain + "_work"]: "yes"}, () => {
                console.log(domain + "_work" + " = yes");
            });
            break;
        case "stop":
            selector.stop();
            break;
        case "extractData":
            setTimeout(function () {
                let testData = [createCurPageSample(undefined)];
                pageDataset.setData(message.pageSamples, testData);
                pageClassificator.setDataset(pageDataset);
                pageClassificator.train();
                pageClassificator.classifyWithMax(0.01);
                console.log(testData);
                console.log(message.collectors);
                if (testData[0].target !== '-') {
                    let collectors = [];
                    for (let i = 0; i < message.collectors.length; ++i) {
                        if (testData[0].target === message.collectors[i].collectorURL) {
                            collectors.push(message.collectors[i]);
                        }
                    }
                    let useData = getUseDataFromCollectors(collectors);
                    sendResponse({message: "ok", useData: useData});
                } else {
                    //
                    sendResponse({message: "200"});
                }

            }, 6000);
            break;
    }
    return true;
});

function getUseDataFromCollectors(collectors) {
    let useData = [];
    for (let i = 0; i < collectors.length; ++i) {
        let collectorDB = collectors[i];
        let newCollector = addCollector(collectorDB.collectorName, collectorDB.collectorType);
        newCollector.getClassificator().setParams(collectorDB.collectorClassificator.params);
        let allElems = document.body.querySelectorAll("*");
        newCollector.getDataset().setData(transformElemsToSample([]), transformElemsToSample(allElems));
        newCollector.getDataset().setTargets(["yes", "no"]);
        let predict_elems = [];
        let predict_ind = newCollector.getClassificator().classify();
        console.log(predict_ind);
        predict_ind.forEach((ind) => {
            predict_elems.push(allElems[ind]);
        });
        // let selector = new Selector();
        // selector.markPredictElems(predict_elems);
        let data = [];
        for (let i = 0; i < predict_elems.length; ++i) {
            data.push(getUseData(predict_elems[i], collectorDB.collectorType));
        }
        console.log(data);
        useData.push({name: collectorDB.collectorName, data:data});
    }
    return useData;
}

function getUseData(elem, type) {
    switch (type) {
        case "text":
            return elem.innerText;
        case "link":
            return elem.querySelector("a").href;
        case "img":
            return elem.src;
    }
}

// событие selected возникает, если элемент на странице выбран
document.addEventListener("selected", (event) => {
    let selectedElems = selector.getSelectedElems();
    if (selectedElems.length > 1) {
        currentDataset = currentCollector.getDataset();
        selector.clearPredictedElems();
        let allElems = document.body.querySelectorAll("*");
        let trainData = transformElemsToSample(selectedElems);
        let testData = transformElemsToSample(allElems);
        currentDataset.setData(trainData, testData);
        currentDataset.setTargets(["yes", "no"]);
        let currentClassificator = currentCollector.getClassificator();
        // TODO: возможно перенести таргеты из датасета в основной скрипт
        currentClassificator.train();
        // TODO:
        // currentClassificator.classify();
        // testData.forEach((sample, index) => {
        //     if (sample.target === "yes") {
        //         console.log("yes");
        //         predict_elems.push(allElems[index]);
        //     }
        // });
        let predict_elems = [];
        let predict_ind = currentClassificator.classify();
        console.log(predict_ind);
        predict_ind.forEach((ind) => {
            predict_elems.push(allElems[ind]);
        });
        selector.markPredictElems(predict_elems);
        currentPredictedElems = predict_elems;
    }
});
