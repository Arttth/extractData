let link = document.createElement("link");
link.rel = "stylesheet";
link.href = chrome.runtime.getURL("css/content.css");
document.head.appendChild(link);

let marker = new Marker();
let mouseHandler = new MouseHandler(marker);
let datasets = [];
let urls = [];
let currentDataset = null;

let rootModal = document.createElement("div");
const shadowRoot = rootModal.attachShadow({mode: 'open'});
document.body.appendChild(rootModal);

function createDataset(name, type) {
    currentDataset = new Dataset(name, type, window.location.href);
    datasets.push(currentDataset);
    // всплывающее окно
    marker.setDataset(currentDataset);
    // подсказка выбрать похожие элементы
}

function createModal(html_src) {
    return fetch(chrome.runtime.getURL(html_src))
        .then(response => response.text())
        .then(html => {
            const cssURL = chrome.runtime.getURL('css/modal.css');

            shadowRoot.innerHTML = `<link rel="stylesheet" href="${cssURL}"</link>`;
            shadowRoot.innerHTML += html;
            return shadowRoot;
        });
}

function createViewElemWindow() {
    createModal("html/view-elem.html")
        .then(root => {
            const createElemBtn = root.querySelector("#create_elem");
            createElemBtn.addEventListener("click", () => {
                createSelectAttrWindow();
            });

            // сохранение в формате CSV
            const endBtn = root.querySelector("#end_btn");
            endBtn.addEventListener("click", (event) => {
                saveToCSV();
            });

        });
}

function createSelectElemWindow() {
    createModal("html/select-elem.html")
        .then(root => {
            const selectElemBtn = root.querySelector("#select_elem");
            selectElemBtn.addEventListener("click", () => {
                mouseHandler.stop();
                createViewElemWindow();
            });


        });
}

function createSelectAttrWindow() {
    createModal("html/type-elem.html")
        .then(root => {
            const typeElemBtn = root.querySelector("#type_btn");
            typeElemBtn.addEventListener("click", (event) => {
                const elemsName = root.querySelector("#elem_name");
                const elemsType = root.querySelector("#elem_type");
                if (elemsName.value.length && elemsType.value) {
                    createSelectElemWindow();
                    createDataset(elemsName.value, elemsType.value);
                    mouseHandler.start();
                    event.stopPropagation();
                } else {
                    console.log("Введите данные");
                }
            });

        });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.message) {
        case "start":
            createViewElemWindow();
            break;
        case "stop":
            mouseHandler.stop();
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

document.addEventListener("datasetsave", (event) => {
    console.log("datasetsave event");
    console.log("size:" + currentDataset.getTrainDatasetSize());
    if (currentDataset.getTrainDatasetSize() > 2) {
           currentDataset.getClassificator().train();
        let elems = document.body.querySelectorAll("*");
        currentDataset.saveTestElems(elems)
        let ids = currentDataset.getClassificator().classify();
        let type = currentDataset.getDatasetType();
        console.log("Predicted data: ");
        let predictedData = [];
        for (let id of ids) {
            elems[id].classList.add("similarDataElem");
            predictedData.push(getUseData(elems[id], type));
        }
        currentDataset.setPredictedData(predictedData);
        // переместить в другое место
    }
});

function saveToCSV() {
    let str = "";
    for (let i = 0; i < datasets.length; ++i) {
        str += datasets[i].getDatasetName() + ";";
    }
    str += "\n";
    for (let i = 0; i < datasets[0].predictedData.length; ++i) {
        for (let j = 0; j < datasets.length; ++j) {
            str += datasets[j].predictedData[i] + ";";
        }
        str += "\n";
    }
    let data = new Blob([str], {type: 'text/csv;charset=UTF-8'});
    let link = document.createElement("a");
    link.href = URL.createObjectURL(data);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
}