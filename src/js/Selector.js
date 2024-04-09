class Selector {
    constructor() {
        this.selectedElems = [];
        this.illegalTags = ["DIV", "FORM"];
        this.mark_train = "mark_train";
        this.possible_mark_train = "possible_mark_train";
        this.possible_del_mark_train = "possible_del_mark_train";
        this.mark_predict = "mark_predict";
    }

    mouseoverBind = this.mouseoverFunc.bind(this);
    mouseoutBind = this.mouseoutFunc.bind(this);
    mouseclickBind = this.mouseclickFunc.bind(this);

    initStyles(styleSrc) {
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = chrome.runtime.getURL(styleSrc);
        document.head.appendChild(link);
    }

    clearMarks() {
        this.selectedElems.forEach(elem => {
            delete elem.dataset.mark;
        });
        this.selectedElems = [];
    }

    clearElems(elems) {
        elems.forEach(elem => {
            delete elem.dataset.mark;
        });
    }

    markPredictElems(elems) {
        console.log(elems);
        if (elems) {
            elems.forEach(elem => {
                if (elem.dataset.mark !== this.mark_train) {
                    elem.dataset.mark = this.mark_predict;
                } else {
                    console.log("ELSE");
                }
            });
        }
    }

    getSelectedElems() {
        return this.selectedElems;
    }

    mouseoverFunc(event) {
        let elem = event.target;
        if (elem && this.illegalTags.indexOf(elem.tagName)) {
            if (elem.dataset.mark === this.mark_train) {
                elem.dataset.mark = this.possible_del_mark_train;
            } else if (elem.dataset.mark === undefined){
                elem.dataset.mark = this.possible_mark_train;
            }
        }
    }

    mouseclickFunc(event) {
        let elem = event.target;
        if (elem && this.illegalTags.indexOf(elem.tagName) && !elem.classList.contains("modal")) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            event.preventDefault();
            if (elem.dataset.mark === this.mark_train) {
                delete elem.dataset.mark;
                // TODO: удаление
                this.selectedElems.splice(this.selectedElems.indexOf(elem));
                // let name = elem.dataset.nameid;
                // this.dataset.removeTrainElem(name);
            } else {
                elem.dataset.mark = this.mark_train;
                this.selectedElems.push(elem);
                // let name = this.dataset.getDatasetName() + Math.random();
                // this.dataset.saveTrainElem(elem, name);
                // elem.dataset.nameid = name;
            }
            // TODO: может быть добавить сообщение о том удалился или добавился элменты (мб передавать кол-во вбыранных)
            document.dispatchEvent(new CustomEvent("selected", {}));
        }
    }

    mouseoutFunc(event) {
        let elem = event.target;
        if (elem && this.illegalTags.indexOf(elem.tagName)) {
            if (elem.dataset.mark === this.possible_del_mark_train || elem.dataset.mark === this.mark_train) {
                elem.dataset.mark = this.mark_train;
            } else if (elem.dataset.mark === this.possible_mark_train) {
                delete elem.dataset.mark;
            }
        }
    }

    start() {
        document.body.addEventListener('mouseover', this.mouseoverBind, true);
        document.body.addEventListener('click', this.mouseclickBind, true);
        document.body.addEventListener('mouseout', this.mouseoutBind, true);
    }

    stop() {
        console.log("stop")
        document.body.removeEventListener("mouseover", this.mouseoverBind, true);
        document.body.removeEventListener('click', this.mouseclickBind, true);
        document.body.removeEventListener('mouseout', this.mouseoutBind, true);
        this.clearMarks();
    }
}
