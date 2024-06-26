// функции для преоброзования html-элемента в объeкт для классификации элемен
function transformElemToSample(elem) {
    let sample = {};
    sample.features = {};
    sample.features.nameClass = nameClass(elem);
    sample.features.id = elem.id;
    sample.features.tagName = elem.nodeName;
    // sample.features.countChildren = countChildren(elem);
    sample.features.parentNameClass = nameClass(elem.parentNode);
    sample.features.parentId = elem.parentNode.id;
    // sample.features.level = level(elem);
    // mvideo гарантия
    sample.features.previousElemText = getTextFromElement(elem.previousElementSibling);
    // sample.features.parentTagName = elem.parentNode.tagName;
    // sample.features.parentPreviousElemText = getTextFromElement(elem.parentNode.previousElementSibling);

    sample.target = "yes";
    return sample
}


function transformElemsToSample(elems) {
    let samples = [];
    elems.forEach((elem) => {
        samples.push(transformElemToSample(elem));
    });
    return samples;
}


function getPreviousElementText(element) {
    let previousElement = element.previousElementSibling;

    let previousElementText = "";
    if (previousElement) {
        while (previousElementText === "" && previousElement.childElementCount === 1) {
            previousElementText = getTextFromElement(previousElement);
            previousElement = previousElement.firstElementChild;
        }
    }

    return previousElement;
}

function getTextFromElement(element) {
    return element ? element.textContent || element.innerText || "" : "";
}
/*
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
    return result.toString();
}
*/
// update
function nameClass(element) {
    const countClass = 3;
    let result = [];

    if (!element || element.classList === 0) {
        return ["-1", "-1"].slice(0, countClass).toString();
    }

    const arrClass = element.classList;

    for (let i = 0; i < countClass; i++) {
        if (arrClass[i]) {
            result.push(arrClass[i]);
        } else {
            result.push("-1");
        }
    }

    return result.toString();
}



function style(element, cssFeats) {
    let styles = window.getComputedStyle(element, null);
    let css = cssFeats;
    let styleLen = css.length;
    const parentStyle = window.getComputedStyle(element.parentNode);
    let result = {};
    for (let i = 0; i < styleLen; i++) {
        let prop = css[i];
        let value = styles.getPropertyValue(prop);
        if (prop === 'font-family') {
            let arr = value.split(', ', 1);
            value = arr[0].replace(/"/g, '');
        }
        else if (prop === 'width') {
            value = Math.floor(parseFloat(styles[prop]) / window.innerWidth  * 30);
        } else if (prop === 'height') {
            value = Math.floor(parseFloat(styles[prop]) / window.innerHeight * 30);
        } else if (prop === 'margin-left' ||  prop === 'margin-right') {
            value = parseFloat(styles[prop]) / parseFloat(parentStyle.width);
        } else if (prop === 'margin-bottom' || prop === 'margin-top') {
            value = parseFloat(styles[prop]) / parseFloat(parentStyle.height);
        }
        result[prop] = value;
    }
    return result;
}

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
function calculateAverageNodeDepth(node, depth = 0) {
    if (!node) {
        return 0;
    }

    let totalDepth = depth;
    let totalNodes = 1;

    for (let i = 0; i < node.children.length; i++) {
        let childResult = calculateAverageNodeDepth(node.children[i], depth + 1);
        totalDepth += childResult.totalDepth;
        totalNodes += childResult.totalNodes;
    }

    return {
        totalDepth: totalDepth,
        totalNodes: totalNodes
    };
}

function getAverageNodeDepth(rootNode) {
    let result = calculateAverageNodeDepth(rootNode);
    return result.totalNodes === 0 ? 0 : result.totalDepth / result.totalNodes;
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
    return Math.round(Math.min(Math.max(0, textLength / 1000), 6));
}

// Функция для получения самого часто встречающегося размера шрифта на странице
function getMostUsedFontSize() {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    const fontSizeCounts = {};

    // Перебираем текстовые элементы на странице
    textElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const fontSize = computedStyle.getPropertyValue('font-size');

        // Увеличиваем счетчик для данного размера шрифта
        if (fontSize in fontSizeCounts) {
            fontSizeCounts[fontSize]++;
        } else {
            fontSizeCounts[fontSize] = 1;
        }
    });

    // Находим самый часто встречающийся размер шрифта
    let mostUsedFontSize = null;
    let maxCount = 0;
    for (const fontSize in fontSizeCounts) {
        if (fontSizeCounts[fontSize] > maxCount) {
            mostUsedFontSize = fontSize;
            maxCount = fontSizeCounts[fontSize];
        }
    }

    return mostUsedFontSize;
}
//////////////////////////
