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

function createViewElemWindow(shadowRoot) {
    createModal("html/view-elem.html", 'css/modal.css', shadowRoot)
        .then(root => {
            let extractTreeName;
            chrome.storage.local.get([domain ])
            const createElemBtn = root.querySelector("#create_elem");
            createElemBtn.addEventListener("click", () => {
                createSelectAttrWindow(shadowRoot);
            });

            // сохранение в формате CSV
            const endBtn = root.querySelector("#end_btn");
            endBtn.addEventListener("click", (event) => {
                saveToCSV();
                chrome.storage.local.set({[domain + "_work"]: "no"}, () => {
                    //
                });
            });
        });
}

function createSelectElemWindow(shadowRoot) {
    createModal("html/select-elem.html",'css/modal.css', shadowRoot)
        .then(root => {
            const selectElemBtn = root.querySelector("#select_elem");
            selectElemBtn.addEventListener("click", () => {
                let domainData = {};
                domainData['pageNaiveBayesParams'] = pageClassificator.getParams();
                let collectorParams = [];
                for (let collector of collectors) {
                    let params = {};
                    params['type'] = collector.type;
                    params['classificatorParams'] = collector.getClassificator().getParams();
                    collectorParams.push(params);
                }

                domainData['collectorsParams'] = collectorParams;
                chrome.storage.local.set({[domain]: domainData}, () => {
                    console.log("collectors saved");
                });
                console.log("domain data");
                chrome.storage.local.get(domain, (data) => {
                    console.log(data);
                });
                selector.stop();
                createViewElemWindow(shadowRoot);
            });

            const cancelSelectElemBtn = root.querySelector("#cancel_select_elem");
            cancelSelectElemBtn.addEventListener("click", () => {
                selector.clearMarks();
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
                    addCollector(elemsName.value, elemsType.value);
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