let link = document.createElement("link");
link.rel = "stylesheet";
link.href = chrome.runtime.getURL("css/content.css");
document.head.appendChild(link);

let selector = new Selector();

let pageClassificator = new NaiveBayes();
let pageDataset = new Dataset();

let datasets = [];
let collectors = new Map();
let urls = [];
let currentCollector = {};
let currentClassificator = null;
let currentDataset = null;


let rootModal = document.createElement("div");
const shadowRoot = rootModal.attachShadow({mode: 'open'});
document.body.appendChild(rootModal);

function addCollector(name, type) {
    currentCollector = new Collector(new Dataset(), new NaiveBayes());
    currentCollector.setName(name);
    currentCollector.setType(type);
    currentCollector.setURL(window.location.href);
    if (!collectors.has(window.location.href)) {
        let sample = {};
        sample.features = {};
        sample.target = window.location.href;
        sample.features.depth = calculateDOMDepth(document.documentElement);
        sample.features.avgDepth = calculateAverageNodeDepth(document.documentElement);
        // sample.features.tagFreq = calculateTagFrequency(document.documentElement);
        sample.features.hasForm = findForms();
        sample.features.countImages = countImages();
        sample.features.title = document.title;
        sample.features.countLinks = countLinks(document.documentElement);
        sample.features.textAmount = calculateTextAmount();
        console.log("SITE SAMPLE = " + sample.target);
        for (let feat in sample.features) {
            console.log(feat);
            console.log(sample.features[feat]);
        }
        pageDataset.saveTrainObj(sample);
    }
    collectors.set(window.location.href, currentCollector);
}

function collectData(selector) {
    let data = [];
    if (selector.type === "link") {

    }
}



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.message) {
        case "start":
            createViewElemWindow(shadowRoot);
            break;
        case "stop":
            selector.stop();
            break;
    }
});

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

// document.addEventListener("datasetsave", (event) => {
//     console.log("datasetsave event");
//     console.log("size:" + currentDataset.getTrainDatasetSize());
//     if (currentDataset.getTrainDatasetSize() > 2) {
//            currentDataset.getClassificator().train();
//         let elems = document.body.querySelectorAll("*");
//         currentDataset.saveTestElems(elems)
//         let ids = currentDataset.getClassificator().classify();
//         let type = currentDataset.getDatasetType();
//         console.log("Predicted data: ");
//         let predictedData = [];
//         for (let id of ids) {
//             elems[id].classList.add("similarDataElem");
//             predictedData.push(getUseData(elems[id], type));
//         }
//         currentDataset.setPredictedData(predictedData);
//         // переместить в другое место
//     }
// });

// событие selected возникает, если элементы на странице выбраны
document.addEventListener("selected", (event) => {
    console.log("selected receieve");
    currentDataset = currentCollector.getDataset();
    let trainData = [];
    let testData = [];
    selector.getSelectedElems().forEach(elem => {
        trainData.push(transformElemToSample(elem));
    });
    currentDataset.setTrainData(trainData);
    let elems = document.body.querySelectorAll("*");
    elems.forEach(elem => {
        testData.push(transformElemToSample(elem));
    });
    currentDataset.setTestData(testData);
    let currentClassificator = currentCollector.getClassificator();
    currentClassificator.setDataset(currentDataset);
    currentClassificator.setTargets(currentDataset.targets);
    currentClassificator.train();
    let predict_elems = [];
    let predict_ind = currentClassificator.classify();
    console.log(predict_ind);
    predict_ind.forEach((ind) => {
        predict_elems.push(elems[ind]);
        console.log(elems[ind].tagName);
    });
    selector.markPredictElems(predict_elems);
});


///////////////////////////////////////
// функции для преоброзования html-элемента в объкт для классификации элементов
function transformElemToSample(elem) {
    let sample = {};
    sample.features = {};
    sample.features.tagName = elem.nodeName;
    sample.features.countChildren = this.countChildren(elem);
    sample.features.level = this.level(elem);
    sample.features.nameClass = this.nameClass(elem);
    this.nameParent(elem).forEach((val, key) => {
        sample.features[key] = val;
    });
    // sample.features.style = this.style(elem);
    sample.target = "yes";
    return sample
}

function nameClass(element) {
    let countClass = 2;
    let result = [];
    try {
        let strClass = element.className;
        let arrClass = strClass.split(' ');
        for (let i = 0; i < countClass; i++) {
            let nameCls = '';
            if ((arrClass[i] === undefined) || (arrClass[i] === "")) {
                // если второго класса нет, либо нет классов совсем -> -1
                result.push("-1");
            } else {
                nameCls = arrClass[i];
                result.push(nameCls)
            }
        }
    } catch (err) {
        // this.illegalTags.push(element.nodeName);
        return false;
    }
    return result
}
function style(element) {
    let styles = window.getComputedStyle(element, null);
    let css = this.anyCss;
    let styleLen = css.length;
    let result = [];
    for (let i = 0; i < styleLen; i++) {
        let prop = css[i];
        let value = styles.getPropertyValue(prop);
        if (prop === 'font-family') {
            let arr = value.split(', ', 1);
            let font = arr[0].replace(/"/g, '');
            value = font;
        }
        result.push(value);
    }
    return result
}
// getTarget(element, datasetClassName) {
//     let target = element.dataset[datasetClassName];
//     if (target === undefined) { return 'NaN' }
//     else { return target }
// }
function countChildren(element) {
    let count = element.querySelectorAll('*').length;
    return count.toString()
}
function level(element) {
    let level = 0;
    while (element.nodeName !== 'BODY') {
        element = element.parentNode;
        level++;
    }
    return level.toString()
}
function nameParent(element) {
    let countParent = 10;
    let result = [];
    for (let i = 1; i <= countParent; i++) {
        let countPar = '';
        if (element.parentNode == null) {
            result.push("-1");
        } else {
            element = element.parentNode;
            countPar = element.nodeName;
            result.push(countPar);
        }
    }
    return result
}

//////////////////////////////////////////////

///////////////////////////////////////
// функции для выделения призанков из страницы для классификации страниц

function calculateDOMDepth(node) {
    if (!node || !node.children || node.children.length === 0) {
        // Если узел не существует, или у него нет дочерних элементов, возвращаем 0
        return 0;
    }

    let maxDepth = 0;

    // Рекурсивно обходим все дочерние узлы и вычисляем их глубину
    for (let i = 0; i < node.children.length; i++) {
        const childDepth = calculateDOMDepth(node.children[i]);
        if (childDepth > maxDepth) {
            maxDepth = childDepth;
        }
    }

    // Возвращаем максимальную глубину дочерних узлов плюс 1 (текущий уровень)
    return maxDepth + 1;
}

// Функция для вычисления средней глубины узлов в дереве DOM
function calculateAverageNodeDepth(node, depth = 0, count = 0) {
    if (!node || !node.children || node.children.length === 0) {
        // Если узел не существует или у него нет дочерних элементов, возвращаем 0
        return 0;
    }

    let totalDepth = depth;

    // Рекурсивно обходим все дочерние узлы и вычисляем суммарную глубину и количество узлов
    for (let i = 0; i < node.children.length; i++) {
        totalDepth += calculateAverageNodeDepth(node.children[i], depth + 1, count + 1);
    }

    // Возвращаем суммарную глубину, деленную на количество узлов
    return count === 0 ? 0 : totalDepth / count;
}

// Функция для вычисления частоты использования различных типов тегов в дереве DOM
function calculateTagFrequency(node, frequencyMap = {}) {
    if (!node) {
        return frequencyMap;
    }

    // Если узел - элемент, увеличиваем счетчик его тега в частотной карте
    if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        frequencyMap[tagName] = (frequencyMap[tagName] || 0) + 1;
    }

    // Рекурсивно обходим все дочерние узлы
    if (node.children && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
            calculateTagFrequency(node.children[i], frequencyMap);
        }
    }

    return frequencyMap;
}

function findForms() {
    const forms = document.getElementsByTagName('form');
    return forms.length > 0;
}

// Функция для подсчета количества изображений на странице
function countImages() {
    const images = document.getElementsByTagName('img');
    return images.length;
}

function countLinks() {
    const links = document.getElementsByTagName('a');
    return links.length;
}

// Функция для вычисления признака количества текста на странице
function calculateTextAmount() {
    const text = document.body.innerText;
    const textLength = text.length;

    // Нормализуем длину текста к диапазону от 0 до 10
    return Math.round(Math.min(Math.max(0, textLength / 1000), 10));
}
//////////////////////////
