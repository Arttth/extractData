'use strict';

let selector = {};

let pageClassificator = new NaiveBayes();
let pageDataset = new Dataset();

let waitingTimeForLoadingPage = 2000;

let collectors = [];
let currentCollector = {};
let currentDataset = null;
let currentPredictedElems = [];

let currentPageSampleName = "";

let domain = document.location.host;
let url = document.location.href;

let rootModal = document.createElement("div");
rootModal.classList.add("rootModalExtractData");
const shadowRoot = rootModal.attachShadow({mode: 'open'});
document.body.appendChild(rootModal);

init();

function init() {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("css/content.css");
    document.head.appendChild(link);

    let work = document.location.host  + "_work";
    console.log(work);
    chrome.storage.local.get(work, (data) => {
        if (data[work] === "yes") {
            console.log("loadStartData yes");
            console.log("LOAD DATA");
            createSelectPageSampleWindow(shadowRoot);
        }
    });
}

function createCollector(name, type, isSingleElemCollector) {
    let collector = new Collector(new Dataset(), new NaiveBayes());
    collector.setName(name);
    collector.setType(type);
    collector.setURL(window.location.href);
    collector.isSingleElemCollector = isSingleElemCollector;
    collector.isReadyToCollect = (isSingleElemCollector !== true);
    collector.pageSampleName = currentPageSampleName;
    return collector;
}
// создает и добавляет сэмпл страницы в глобальный датасет
function addPageSample(pageSampleName, url) {
    let isNewUrl = true;
    for (let collector of collectors) {
        if (collector.url === url) {
            isNewUrl = false;
        }
    }
    if (isNewUrl) {
        let sample = createCurPageSample(pageSampleName, url);
        pageDataset.addTrainSample(sample);
        return sample;
    }
    return undefined;
}

// создает сэмпл страницы для классификации
function createCurPageSample(pageSampleName, url) {
    let sample = {};
    sample.features = {};
    sample.target = pageSampleName;
    sample.features.depth = calculateDOMDepth(document.documentElement);
    sample.features.avgDepth = Math.floor(getAverageNodeDepth(document.documentElement));
    sample.features.hasForm = findForms();
    sample.features.countImages = countImages();
    sample.features.title = document.title;
    // sample.features.countLinks = countLinks(document.documentElement);
    sample.features.textAmount = calculateTextAmount();
    sample.features.fontSize = getMostUsedFontSize();
    // sample.features.h1 = document.querySelector('h1').textContent;
    sample.url = url;
    return sample;
}

function createTimer(ms) {
    let timer = document.createElement('div');
    timer.style.fontSize = '56px';
    timer.style.position = 'fixed';
    timer.style.top = window.innerHeight/3 + 'px';
    timer.style.left = '50px';
    timer.style.zIndex = '30000';
    timer.innerHTML = (ms/1000).toString();
    document.body.append(timer);
    return setInterval(function updateTimer() {
        timer.innerHTML = timer.innerHTML !== '0' ? (Number(timer.innerHTML)-1).toString() : '0';
    }, 1000);
}

// function doRandomEvents(ms) {
//     return setInterval(function updateTimer() {
//         window.scrollTo({
//             left: 0,
//             top: document.body.scrollHeight/2,
//             behavior: 'smooth'
//         })
//     }, 2000);
// }


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
            // ожидание полной загрузки страницы
            let stopTimerId = createTimer(waitingTimeForLoadingPage);
            // let stopDoRandomEvents = doRandomEvents();
            setTimeout(async function () {
                clearInterval(stopTimerId);
                // clearInterval(stopDoRandomEvents);
                // классификация страницы
                let testData = [createCurPageSample(undefined, window.location.href)];
                pageDataset.setData(message.pageSamples, testData);
                pageClassificator.setDataset(pageDataset);
                pageClassificator.trainWithReset();
                pageClassificator.predict(0.0001);
                // данные извлеченные со страницы
                // представляет собой массив объектов {имя сборщика, тип собираемых данных, массив данных}
                let useData = [];
                currentPageSampleName = testData[0].target;
                if (testData[0].target !== '-') {
                    let curPageCollectors = message.collectors
                        .filter(collector => testData[0].target === collector.pageSampleName)
                        .map(createCollectorFromDB);

                    if (curPageCollectors.length === 0) {
                        console.log("Нет сборщиков для страницы " + testData[0].pageSampleName);
                        sendResponse({message: "continue marked"})
                    } else {
                        let notReadyToCollect = [];
                        for (let i = 0; i < curPageCollectors.length; ++i) {
                            if (curPageCollectors[i].isSingleElemCollector && !curPageCollectors[i].isReadyToCollect) {
                                notReadyToCollect.push(curPageCollectors[i]);
                            } else {
                                if (curPageCollectors[i].isSingleElemCollector) {
                                    useData.push(getUseDataFromSingleElemCollector(curPageCollectors[i]));
                                } else {
                                    useData.push(getUseDataFromCollector(curPageCollectors[i]));
                                }
                            }
                        }

                        if (notReadyToCollect.length > 0) {
                            createSelectPageSampleWindowUntilExtract(shadowRoot, notReadyToCollect);
                            for (let i = 0; i < notReadyToCollect.length; ++i) {
                                getUseDataFromSingleElemCollector(notReadyToCollect[i]);
                            }
                            document.addEventListener("collectorsUpdated", (event) => {
                                if (event.detail?.selectedData) {
                                    useData = useData.concat(event.detail.selectedData);
                                }

                                if (useData.length > 0) {
                                    sendResponse({
                                        message: "singleElemCollectorUpdate",
                                        useData: useData,
                                        collectors: event.detail.collectors
                                    });
                                } else {
                                    sendResponse({
                                        message: "singleElemCollectorUpdate",
                                        useData: [],
                                        collectors: event.detail.collectors
                                    });
                                }
                            });
                        } else {
                            if (useData.length > 0) {
                                sendResponse({message: "ok", useData: useData});
                            } else {
                                sendResponse({message: "without singleElem useData not!"});
                            }
                        }
                    }
                } else {
                    let isMark = confirm("Страница не похожа на размеченные. Начать рамечать страницу?");
                    if (isMark) {
                        document.addEventListener("collectorSaved", (event) => {
                            let data = [];
                            event.detail.selectedElems.forEach(elem => {
                               data.push(getUseData(elem, event.detail.collector.collectorType));
                            });

                            sendResponse({
                                message: "update",
                                pageSample: addPageSample(currentPageSampleName, window.location.href),
                                collector: event.detail.collector,
                                useData: {
                                    name: event.detail.collector.name,
                                    type: event.detail.collector.type,
                                    data: data
                                }
                            });
                            console.log(event.detail.collector);
                        });
                        createSelectPageSampleWindowUntilExtract(shadowRoot, message.collectors);
                    } else {
                        sendResponse({message: "continue unmarked"});
                    }
                }

            }, waitingTimeForLoadingPage);
            break;
    }
    return true;
});

function createCollectorFromDB(collectorDB) {
    let newCollector = createCollector(collectorDB.collectorName, collectorDB.collectorType, collectorDB.isSingleElemCollector);
    newCollector.getClassificator().setParams(collectorDB.collectorClassificator.params);
    newCollector.isReadyToCollect = collectorDB.isReadyToCollect;
    newCollector.getDataset().setTargets(["yes", "no"]);
    newCollector.getClassificator().setThreshold(collectorDB.optimalThreshold);
    return newCollector;
}
function getUseDataFromCollector(collector) {
    let allElems = document.body.querySelectorAll("*");
    collector.getDataset().setData(transformElemsToSample([]), transformElemsToSample(allElems));
    let predict_elems = [];
    let predict_ind = collector.getClassificator().predict(collector.getClassificator().getThreshold());
    predict_ind.forEach((ind) => {
        predict_elems.push(allElems[ind]);
    });
    let selector = new Selector(false);
    selector.markPredictElems(predict_elems);
    let data = [];
    for (let i = 0; i < predict_elems.length; ++i) {
        data.push(getUseData(predict_elems[i], collector.type));
    }
    return {name: collector.name, type: collector.type, data:data};
}

function getUseDataFromSingleElemCollector(collector) {
    let allElems = document.body.querySelectorAll("*");
    collector.getDataset().setData(transformElemsToSample([]), transformElemsToSample(allElems));
    let predict_elems = [];
    let predict_ind = collector.getClassificator().predict(collector.getClassificator().getThreshold());
    predict_ind.forEach((ind) => {
        predict_elems.push(allElems[ind]);
    });
    let selector = new Selector(false);
    selector.markPredictElems(predict_elems);
    let data = [];
    for (let i = 0; i < predict_elems.length; ++i) {
        data.push(getUseData(predict_elems[i], collector.type));
    }
    return {name: collector.name, type: collector.type, data: data};
}


function getUseData(elem, type) {
    switch (type) {
        case "text":
            return elem.innerText;
        case "link":
            return getLink(elem);
        case "pagination_link":
            return getLink(elem);
        case "img":
            return elem.src;
    }
}

function getLink(elem) {
    let link_elem = elem;
    if (elem.tagName === 'A') {
        link_elem =  elem;
    } else if ((link_elem = elem.querySelector("a")))  {

    } else if ((link_elem = getAnchorElement(elem, 6))) {

    } else {
        alert("Несоответствие типов, не может быть извлечен link")
        return elem.innerText;
    }
    return link_elem.href;
}

function getAnchorElement(element, maxDepth = 10) {
    let depth = 0;
    while (element && depth < maxDepth) {
        if (element.tagName === 'A') {
            return element;
        }
        element = element.parentElement;
        depth++;
    }
    return null;
}

// событие selected возникает, если элемент на странице выбран
document.addEventListener("selected", selectElems);

function findOptimalThreshold(classifier, validationData, step = 0.01) {
    let bestThreshold = 0;
    let bestF1Score = 0;

    for (let threshold = 0; threshold <= 1; threshold += step) {
        let tp = 0, fp = 0, fn = 0;

        for (let sample of validationData) {
            let probs = classifier.calculateProbabilities(sample.features);
            let maxProb = Math.max(...probs);
            let predicted = maxProb > threshold ? classifier.dataset.targets[probs.indexOf(maxProb)] : "-";

            if (predicted === sample.target && predicted !== "-") {
                tp++;
            } else if (predicted !== sample.target && predicted !== "-") {
                fp++;
            } else if (predicted === "-" && sample.target !== "-") {
                fn++;
            }
        }

        let precision = tp / (tp + fp);
        let recall = tp / (tp + fn);
        let f1Score = 2 * (precision * recall) / (precision + recall);

        if (f1Score >= bestF1Score) {
            bestF1Score = f1Score;
            bestThreshold = threshold;
        }
    }

    if (bestThreshold < 0.01) {
        bestThreshold = 0.01;
    }
    return bestThreshold;
}

function splitDataset(dataset, trainRatio = 0.8) {
    // Перемешаем массив случайным образом для случайного разбиения
    const shuffled = dataset.sort(() => 0.5 - Math.random());

    // Определим размер тренировочной выборки
    const trainSize = Math.ceil(dataset.length * trainRatio);

    // Разделим массив на тренировочную и тестовую выборки
    let trainData = shuffled.slice(0, trainSize);
    let validationData = shuffled.slice(trainSize-1);

    return { trainData, validationData };
}


function selectElems() {
    let selectedElems = selector.getSelectedElems();
    currentDataset = currentCollector.getDataset();
    selector.clearPredictedElems();
    if (!currentCollector.isSingleElemCollector) {
        let allElems = document.body.querySelectorAll("*");
        let selectedData = transformElemsToSample(selectedElems);
        let {trainData, validationData} = splitDataset(selectedData);
        let testData = transformElemsToSample(allElems);
        currentDataset.setData(trainData, testData);
        currentDataset.setTargets(["yes", "no"]);
        let currentClassificator = currentCollector.getClassificator();
        currentClassificator.clearParams();
        currentClassificator.fit();
        const optimalThreshold = findOptimalThreshold(currentClassificator, validationData);
        currentCollector.getClassificator().setThreshold(optimalThreshold);
        console.log('Optimbal threshold: ' + optimalThreshold);
        let predict_elems = [];
        let predict_ind = currentClassificator.predict(optimalThreshold);
        console.log(predict_ind);
        predict_ind.forEach((ind) => {
            predict_elems.push(allElems[ind]);
            testData[ind].target = "yes";
        });
        selector.markPredictElems(predict_elems);
        currentPredictedElems = predict_elems;
    }  else {
        let selectedData = transformElemsToSample(selectedElems);
        let {trainData, validationData} = splitDataset(selectedData);
        currentDataset.setData(trainData, []);
        currentDataset.setTargets(["yes", "no"]);
        let currentClassificator = currentCollector.getClassificator();
        currentClassificator.fit();
        const optimalThreshold = findOptimalThreshold(currentClassificator, validationData);
        currentCollector.getClassificator().setThreshold(optimalThreshold);
    }
}

