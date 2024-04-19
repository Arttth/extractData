// создает окно
function createModal(html_src, css_src, shadowRoot) {
    return fetch(chrome.runtime.getURL(html_src))
        .then(response => response.text())
        .then(html => {
            const cssURL = chrome.runtime.getURL(css_src);

            shadowRoot.innerHTML = `<link rel="stylesheet" href="${cssURL}"</link>`;
            shadowRoot.innerHTML += html;
            return shadowRoot;
        });
}

function createExtractor(shadowRoot) {
    createModal("html/create-extractor.html", 'css/modal.css', shadowRoot)
        .then(root => {

            const createExtractorBtn = root.querySelector("#create_extractor_btn");
            const extractorName = root.querySelector("#extractor_name");
            const extractorUrl = root.querySelector("#extractor_url");
            extractorUrl.value = window.location.href;
            createExtractorBtn.addEventListener("click", () => {
                if (extractorName.value.length && extractorUrl.value.length) {
                    saveExtractor({
                        'extractorName': extractorName.value,
                        'extractorUrl': extractorUrl.value,
                    });

                    createViewElemWindow(shadowRoot);
                }
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
                    "extractorName": extractorSelect.value
                }, response => {
                    console.log(response);
                });
                createViewElemWindow(shadowRoot);

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

            // сохранение в формате CSV
            const endBtn = root.querySelector("#end_btn");
            endBtn.addEventListener("click", (event) => {
                chrome.storage.local.set({[domain + "_work"]: "no"}, () => {
                    //
                });
                // saveToCSV();
                chrome.runtime.sendMessage({message: "extract" }, response => {
                    console.log(response);
                });
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
                collector['collectorURL'] = currentCollector.url;
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
        });
}

function createSelectAttrWindow(shadowRoot) {
    console.log("collector size = " + collectors.size);
    createModal("html/type-elem.html", 'css/modal.css', shadowRoot)
        .then(root => {
            const typeElemBtn = root.querySelector("#type_btn");
            typeElemBtn.addEventListener("click", (event) => {
                const elemsName = root.querySelector("#elem_name");
                const elemsType = root.querySelector("#elem_type");
                if (elemsName.value.length && elemsType.value) {
                    createSelectElemWindow(shadowRoot);
                    let pageSample = addPageSample();
                    if (pageSample !== undefined) {
                        savePageSample(pageSample);
                    }
                    addCollector(elemsName.value, elemsType.value);
                    selector = new Selector();
                    selector.start();
                    event.stopPropagation();
                } else {
                    console.log("Введите данные");
                }
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