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
            const createElemBtn = root.querySelector("#create_elem");
            createElemBtn.addEventListener("click", () => {
                createSelectAttrWindow(shadowRoot);
            });

            // сохранение в формате CSV
            const endBtn = root.querySelector("#end_btn");
            endBtn.addEventListener("click", (event) => {
                saveToCSV();
            });

        });
}

function createSelectElemWindow(shadowRoot) {
    createModal("html/select-elem.html",'css/modal.css', shadowRoot)
        .then(root => {
            const selectElemBtn = root.querySelector("#select_elem");
            selectElemBtn.addEventListener("click", () => {
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