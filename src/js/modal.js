function createModal(title, contentClass) {
    console.log("create modal");
    const root = document.createElement("div");
    const shadowRoot = root.attachShadow({mode: 'open'});

    const cssURL = chrome.runtime.getURL('css/modal.css');
    shadowRoot.innerHTML = `<link rel="stylesheet" href="${cssURL}"</link>`;

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.draggable = true;
    const modal_body = document.createElement("div");
    modal_body.className = "modal_body";
    const modal_content = document.createElement("div");
    modal_content.className = "modal_content";
    modal_content.classList.add(contentClass);
    const modal_header = document.createElement("div");
    modal_header.className = "modal_header";
    const modal_close = document.createElement("div");
    modal_close.className = "modal_close";
    modal_close.innerHTML = "X";
    const modal_title = document.createElement("modal_title");
    modal_title.className = "modal_title";
    modal_title.innerHTML = title;



    modal_content.appendChild(modal_header);
    modal_header.appendChild(modal_close);
    modal_header.appendChild(modal_title);
    modal_body.appendChild(modal_content);
    modal.appendChild(modal_body);
    shadowRoot.appendChild(modal);
    document.body.appendChild(shadowRoot);
}

function createSelector() {
    console.log("create Selector");
    const root = document.createElement("div");
    const shadowRoot = root.attachShadow({mode: 'open'});

    const cssURL = chrome.runtime.getURL('css/modal.css');
    shadowRoot.innerHTML = `<link rel="stylesheet" href="${cssURL}"</link>`;

    const iframe = document.createElement("iframe");
    iframe.className = "modal_select";
    iframe.id = "modal_select";
    const htmlURL = chrome.runtime.getURL('html/type-elem.html');
    iframe.src = htmlURL;
    iframe.width = '300px';
    iframe.height = '500px';

    shadowRoot.appendChild(iframe);
    document.body.appendChild(shadowRoot);
    console.log(iframe);
}