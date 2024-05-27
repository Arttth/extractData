// создает окно
function createModal(html_src, css_src, shadowRoot) {
    return fetch(chrome.runtime.getURL(html_src))
        .then(response => response.text())
        .then(html => {
            const cssURL = chrome.runtime.getURL(css_src);

            shadowRoot.innerHTML = `<link rel="stylesheet" href="${cssURL}"</link>`;
            shadowRoot.innerHTML += html;
            shadowRoot.querySelector('.modal_close').addEventListener('click', (event) => {
                shadowRoot.innerHTML = '';
            });
            return shadowRoot;
        });
}

function createExtractor(shadowRoot) {
    createModal("html/create-extractor.html", 'css/modal.css', shadowRoot)
        .then(root => {

            const createExtractorBtn = root.querySelector("#create_extractor_btn");
            const extractorName = root.querySelector("#extractor_name");
            const extractorStartUrl = root.querySelector("#extractor_url");
            extractorStartUrl.value = window.location.href;
            createExtractorBtn.addEventListener("click", () => {
                if (extractorName.value.length && extractorStartUrl.value.length) {
                    saveExtractor({
                        'extractorName': extractorName.value,
                        'extractorStartUrl': extractorStartUrl.value,
                    });

                    createSelectPageSampleWindow(shadowRoot);
                }
            });
        });
}

function isMarkPage(shadowRoot) {
    createModal("html/isMarkPage.html", 'css/modal.css', shadowRoot)
        .then(root => {
            const posMarkBtn = root.querySelector("#pos_mark_btn");
            const negMarkBtn = root.querySelector("#neg_mark_btn");
            posMarkBtn.addEventListener("click", () => {

            });

            negMarkBtn.addEventListener("click", () => {

            });
        });
}


function selectExtractor(shadowRoot) {
    createModal("html/select-extractor.html", 'css/modal.css', shadowRoot)
        .then(root => {

            const selectExtractorBtn = root.querySelector("#select_extractor_btn");
            selectExtractorBtn.addEventListener("click", () => {
                chrome.runtime.sendMessage({
                    message: "makeExtractorCurrent",
                    "extractorName": extractorSelect.options[extractorSelect.selectedIndex].text
                }, response => {
                    console.log(response);
                });
                createSelectPageSampleWindow(shadowRoot);
            });

            const extractorSelect = root.querySelector("#extractor_name");
            chrome.runtime.sendMessage({message: "getExtractors"}, (response)  => {

                for (let i = 0; i < response.extractors.length; ++i) {
                    extractorSelect.append(new Option(response.extractors[i].extractorName,
                        response.extractors[i].extractorName));
                }

            });


            const createExtractorBtn = root.querySelector("#create_extractor_btn");
            createExtractorBtn.addEventListener("click", () => {
                createExtractor(shadowRoot);
            });

        });
}

function createViewElemWindow(shadowRoot) {
    createModal("html/view-elem.html", 'css/modal.css', shadowRoot)
        .then(root => {
            const createElemBtn = root.querySelector("#create_elem");
            createElemBtn.addEventListener("click", () => {
                createSelectAttrWindow(shadowRoot);
            });

            const endBtn = root.querySelector("#end_btn");
            endBtn.addEventListener("click", (event) => {
                chrome.storage.local.set({[domain + "_work"]: "no"}, () => {
                    //
                });

                chrome.runtime.sendMessage({message: "extract"}, response => {
                    console.log(response);
                });
            });
        });
}

function createSelectPageSampleWindow(shadowRoot) {
    createModal("html/select-pageSample.html", 'css/modal.css', shadowRoot)
        .then(root => {
            const createElemBtn = root.querySelector("#create_pageSample_btn");
            createElemBtn.addEventListener("click", () => {
                createPageSampleWindow(shadowRoot);
            });

            const pageSampleSelect = root.querySelector("#pageSample_name");
            chrome.runtime.sendMessage({message: "getPageSamplesByExtractor"}, (response)  => {
                let uniquePageSamples = [];
                response.pageSamples.forEach(pageSample => {
                    let isUniqueName = true;
                    for (let i = 0; i < uniquePageSamples.length; ++i) {
                        if (uniquePageSamples[i].target === pageSample.target) {
                            isUniqueName = false;
                            break;
                        }
                    }
                    if (isUniqueName === true) {
                        uniquePageSamples.push(pageSample);
                    }
                });
                for (let i = 0; i < uniquePageSamples.length; ++i) {
                    pageSampleSelect.append(new Option(uniquePageSamples[i].target,
                        uniquePageSamples[i].target));
                }
            });

            const selectPageSampleBtn = root.querySelector("#select_pageSample_btn");
            selectPageSampleBtn.addEventListener('click', () => {
                currentPageSampleName = pageSampleSelect.options[pageSampleSelect.selectedIndex].text;
                let pageSample = addPageSample(currentPageSampleName, window.location.href);
                savePageSample(pageSample);
                createViewElemWindow(shadowRoot);
            });
            

            const endBtn = root.querySelector("#end_btn");
            endBtn.addEventListener("click", (event) => {
                chrome.storage.local.set({[domain + "_work"]: "no"}, () => {
                    //
                });

                chrome.runtime.sendMessage({message: "extract"}, response => {
                    console.log(response);
                });
            });
        });
}


function createPageSampleWindow(shadowRoot) {
    createModal("html/create-pageSample.html", 'css/modal.css', shadowRoot)
        .then(root => {
            const createElemBtn = root.querySelector("#create_pageSample_btn");
            const pageSampleName = root.querySelector("#pageSample_name");
            createElemBtn.addEventListener("click", () => {
                if (pageSampleName.value.length > 0) {
                    let pageSample = addPageSample(pageSampleName.value, window.location.href);
                    currentPageSampleName = pageSampleName.value;
                    savePageSample(pageSample);
                    createViewElemWindow(shadowRoot);
                }
            });


            const backBtn = root.querySelector("#back_pageSample");
            backBtn.addEventListener("click", (event) => {
                createSelectPageSampleWindow(shadowRoot);
            });
        });
}

function createSelectElemWindow(shadowRoot) {
    createModal("html/select-elem.html",'css/modal.css', shadowRoot)
        .then(root => {
            const selectElemBtn = root.querySelector("#select_elem");
            selectElemBtn.addEventListener("click", () => {
                let collector = {};
                collector['collectorName'] = currentCollector.name;
                collector['collectorType'] = currentCollector.type;
                collector['collectorClassificator'] = currentCollector.getClassificator().getParams();
                collector['pageSampleName'] = currentPageSampleName;
                collector['isSingleElemCollector'] = currentCollector.isSingleElemCollector;
                collector['isReadyToCollect'] = currentCollector.isReadyToCollect;
                collector['optimalThreshold'] = currentCollector.getClassificator().getThreshold();
                saveCollector(collector);

                selector.stop();
                createViewElemWindow(shadowRoot);
            });

            const cancelSelectElemBtn = root.querySelector("#cancel_select_elem");
            cancelSelectElemBtn.addEventListener("click", () => {
                selector.clearElems();
            });

            const backSelectElemBtn = root.querySelector("#back_select_elem");
            backSelectElemBtn.addEventListener("click", () => {
                selector.stop();
                createSelectAttrWindow(shadowRoot);
            });

            let div = document.createElement("div");
            root.querySelector(".modal_content").append(div);
            div.innerHTML = "Количество предсказанных элементов: " + 0;
            div.offsetWidth = 100;
            div.offsetHeight = 100;
            div.id = "myDiv";
            document.body.addEventListener("click", () => {
                div.innerHTML = "Количество предсказанных элементов: " + currentPredictedElems.length;
            });
        });
}

function createSelectAttrWindow(shadowRoot) {
    createModal("html/type-elem.html", 'css/modal.css', shadowRoot)
        .then(root => {
            const backSelectElemBtn = root.querySelector("#back_select_elem");
            backSelectElemBtn.addEventListener("click", () => {
                createSelectPageSampleWindow(shadowRoot);
            });

            const typeElemBtn = root.querySelector("#type_btn");
            typeElemBtn.addEventListener("click", (event) => {
                const elemsName = root.querySelector("#elem_name");
                const elemsType = root.querySelector("#elem_type");
                const elemSingleCheckBox = root.querySelector("#elem_single");
                if (elemsName.value.length && elemsType.value) {
                    createSelectElemWindow(shadowRoot);
                    // let pageSample = addPageSample();
                    // if (pageSample !== undefined) {
                    //     savePageSample(pageSample);
                    // }
                    currentCollector = createCollector(elemsName.value, elemsType.value, elemSingleCheckBox.checked);
                    collectors.push(currentCollector);

                    selector = new Selector(elemSingleCheckBox.checked);
                    selector.start();
                    event.stopPropagation();
                } else {
                    console.log("Введите данные");
                }
            });

        });
}

function createSelectPageSampleWindowUntilExtract(shadowRoot, collectors) {
    createModal("html/select-pageSample.html", 'css/modal.css', shadowRoot)
        .then(root => {
            const createPageSampleBtn = root.querySelector("#create_pageSample_btn");
            createPageSampleBtn.addEventListener("click", () => {
                createPageSampleWindowUntilExtract(shadowRoot);
            });

            const pageSampleSelect = root.querySelector("#pageSample_name");
            chrome.runtime.sendMessage({message: "getPageSamplesByExtractor"}, (response)  => {
                let uniquePageSamples = [];
                response.pageSamples.forEach(pageSample => {
                    let isUniqueName = true;
                    for (let i = 0; i < uniquePageSamples.length; ++i) {
                        if (uniquePageSamples[i].target === pageSample.target) {
                            isUniqueName = false;
                            break;
                        }
                    }
                    if (isUniqueName === true) {
                        uniquePageSamples.push(pageSample);
                    }
                });

                for (let i = 0; i < uniquePageSamples.length; ++i) {
                    pageSampleSelect.append(new Option(uniquePageSamples[i].target,
                        uniquePageSamples[i].target));
                }
            });

            const selectPageSampleBtn = root.querySelector("#select_pageSample_btn");
            selectPageSampleBtn.addEventListener('click', () => {
                currentPageSampleName = pageSampleSelect.options[pageSampleSelect.selectedIndex].text;
                let pageSample = addPageSample(currentPageSampleName, window.location.href);
                savePageSample(pageSample);
                createUpdateCollectorsUntilExtract(root, collectors);
            });

            const endBtn = root.querySelector("#end_btn");
            endBtn.style.display = "none";
        });
}

function createViewElemWindowUntilExtract(shadowRoot) {
    createModal("html/view-elem.html", 'css/modal.css', shadowRoot)
        .then(root => {
            const createElemBtn = root.querySelector("#create_elem");
            createElemBtn.addEventListener("click", () => {
                createSelectAttrWindow(shadowRoot);
            });

            const endBtn = root.querySelector("#end_btn");
            endBtn.addEventListener("click", (event) => {

            });
        });
}

function createSelectElemWindowUntilExtract(shadowRoot) {
    createModal("html/select-elem.html",'css/modal.css', shadowRoot)
        .then(root => {
            const selectElemBtn = root.querySelector("#select_elem");
            selectElemBtn.addEventListener("click", () => {
                let collector = {};
                collector['collectorName'] = currentCollector.name;
                collector['collectorType'] = currentCollector.type;
                collector['collectorClassificator'] = currentCollector.getClassificator().getParams();
                collector['collectorURL'] = currentCollector.url;
                collector['isSingleElemCollector'] = currentCollector.isSingleElemCollector;
                collector['isReadyToCollect'] = currentCollector.isReadyToCollect;

                document.dispatchEvent(new CustomEvent("collectorSaved", { detail:
                        { collector: collector, selectedElems:  selector.getSelectedElems() }
                }));
                selector.stop();
            });

            const cancelSelectElemBtn = root.querySelector("#cancel_select_elem");
            cancelSelectElemBtn.addEventListener("click", () => {
                selector.clearElems();
            });

            const backSelectElemBtn = root.querySelector("#back_select_elem");
            backSelectElemBtn.addEventListener("click", () => {
                selector.stop();
                createSelectAttrWindow(shadowRoot);
            });

            let div = document.createElement("div");
            root.querySelector(".modal_content").append(div);
            div.innerHTML = "Количество предсказанных элементов: " + 0;
            div.offsetWidth = 100;
            div.offsetHeight = 100;
            div.id = "myDiv";
            document.body.addEventListener("click", () => {
                console.log("click" + currentPredictedElems.length);
                div.innerHTML = "Количество предсказанных элементов: " + currentPredictedElems.length;
            });
        });
}

function createSelectAttrWindowUntilExtract(shadowRoot) {
    createModal("html/type-elem.html", 'css/modal.css', shadowRoot)
        .then(root => {
            const typeElemBtn = root.querySelector("#type_btn");
            typeElemBtn.addEventListener("click", (event) => {
                const elemsName = root.querySelector("#elem_name");
                const elemsType = root.querySelector("#elem_type");
                const elemSingleCheckBox = root.querySelector("#elem_single");
                if (elemsName.value.length && elemsType.value) {
                    createSelectElemWindowUntilExtract(shadowRoot);
                    // let pageSample = addPageSample();
                    // if (pageSample !== undefined) {
                    //     savePageSample(pageSample);
                    // }
                    currentCollector = createCollector(elemsName.value, elemsType.value, elemSingleCheckBox.checked);
                    selector = new Selector(elemSingleCheckBox.checked);
                    selector.start();
                    event.stopPropagation();
                } else {
                    console.log("Введите данные");
                }
            });
        });
}

function createPageSampleWindowUntilExtract(shadowRoot) {
    createModal("html/create-pageSample.html", 'css/modal.css', shadowRoot)
        .then(root => {
            const createPageSampleBtn = root.querySelector("#create_pageSample_btn");
            const pageSampleName = root.querySelector("#pageSample_name");
            createPageSampleBtn.addEventListener("click", () => {
                if (pageSampleName.value.length > 0) {
                    let pageSample = addPageSample(pageSampleName.value, window.location.href);
                    currentPageSampleName = pageSampleName.value;
                    savePageSample(pageSample);
                    createSelectAttrWindowUntilExtract(shadowRoot);
                }
            });


            const backBtn = root.querySelector("#back_pageSample");
            backBtn.addEventListener("click", (event) => {
                createSelectPageSampleWindow(shadowRoot);
            });
        });
}



function createUpdateCollectorsUntilExtract(shadowRoot, collectors) {
    createModal("html/update-collectors.html", 'css/modal.css', shadowRoot)
        .then(root => {
            let selectedCollectorName = "empty";
            let selector;
            let selectedData = [];
            let currentPageSampleCollectors = [];
            if (collectors.length > 0 && collectors[0].name === undefined) {
                currentPageSampleCollectors = collectors
                    .filter(collector => currentPageSampleName === collector.pageSampleName)
                    .map(createCollectorFromDB);
            } else {
                currentPageSampleCollectors = collectors;
            }

            function updateCollector()  {
                for (let i = 0; i < currentPageSampleCollectors.length; ++i) {
                    if (currentPageSampleCollectors[i].name === selectedCollectorName) {
                        let selectedElems = selector.getSelectedElems();
                        currentPageSampleCollectors[i].getClassificator().fitPartial(transformElemToSample(selectedElems[0]));
                        selectedData.push({
                            name: currentPageSampleCollectors[i].name,
                            type: currentPageSampleCollectors[i].type,
                            data: [getUseData(selectedElems[0], currentPageSampleCollectors[i].type)]
                        });
                        break;
                    }
                }
                selector.stop();
            }

            document.removeEventListener("selected", selectElems);
            document.addEventListener("selected", updateCollector);

            let collectorsTableTBody = root.querySelector("#collectors_table_tBody");


            for (let i = 0; i < currentPageSampleCollectors.length; ++i) {
                let tr = document.createElement('tr');

                let tdName = document.createElement('td');
                tdName.innerText = currentPageSampleCollectors[i].name;
                tr.append(tdName);
                let tdType = document.createElement('td');
                tdType.innerText = currentPageSampleCollectors[i].type;
                tr.append(tdType);

                tr.addEventListener("click", (event) => {
                    let elem = event.target;
                    let row = elem;
                    while (row.tagName !== "TR") {
                        row = row.parentNode;
                    }

                    row.style.background = "green";
                    selectedCollectorName = row.querySelector('td').innerText;

                    selector = new Selector(false);
                    selector.start();
                });

                collectorsTableTBody.append(tr);
            }

            let btn = root.querySelector("#update_collectors_btn");
            let updatedCollectors = [];
            btn.addEventListener('click', () => {
                let changeIsSingleElem = false;
                if (selectedCollectorName === "empty") {
                    changeIsSingleElem = true;
                }

                for (let i = 0; i < currentPageSampleCollectors.length; ++i) {
                    let collector = {};
                    collector['collectorName'] = collectors[i].name;
                    collector['collectorType'] = collectors[i].type;
                    collector['collectorClassificator'] = collectors[i].getClassificator().getParams();
                    collector['pageSampleName'] = currentPageSampleName;
                    collector['isSingleElemCollector'] = collectors[i].isSingleElemCollector;
                    if (changeIsSingleElem) {
                        collector['isReadyToCollect'] = !collectors[i].isReadyToCollect;
                    } else {
                        collector['isReadyToCollect'] = collectors[i].isReadyToCollect;
                    }
                    collector['optimalThreshold'] = collectors[i].getClassificator().getThreshold();

                    updatedCollectors.push(collector);
                }

                document.removeEventListener("selected", updateCollector);
                document.dispatchEvent(new CustomEvent("collectorsUpdated", {detail: { selectedData: selectedData, collectors: updatedCollectors }}));
            });
        });
}
// TODO: может сделать класс для окна

// class Modal {
//     // TODO: maybe add drag and drop
//     // posX = 0;
//     // posY = 0;
//     rootElem = {};
//
//     constructor(id) {
//
//     }
//
// }