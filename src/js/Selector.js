// TODO: сохранять все помеченные элементы
class Selector {
    constructor(isSingleElem) {
        this.selectedElems = [];
        this.predictedElems = [];
        this.illegalTags = [];
        this.mark_train = "mark_train";
        this.possible_mark_train = "possible_mark_train";
        this.possible_del_mark_train = "possible_del_mark_train";
        this.mark_predict = "mark_predict";
        this.isSingleElem = isSingleElem;
    }

    mouseoverBind = this.mouseoverFunc.bind(this);
    mouseoutBind = this.mouseoutFunc.bind(this);
    mouseclickBind = this.mouseclickFunc.bind(this);
    mouseclickOneElemBind = this.mouseclickOneElemFunc.bind(this);


    clearSelectedElems() {
        this.selectedElems.forEach(elem => {
            delete elem.dataset.mark;
        });
        this.selectedElems = [];
    }

    clearPredictedElems() {
        this.predictedElems.forEach(elem => {
            delete elem.dataset.mark;
        })
        this.predictedElems = [];
    }

    clearElems() {
        this.clearSelectedElems();
        this.clearPredictedElems();
    }

    markPredictElems(elems) {
        console.log(elems);
        if (elems) {
            elems.forEach(elem => {
                if (elem.dataset.mark !== this.mark_train) {
                    elem.dataset.mark = this.mark_predict;
                    this.predictedElems.push(elem);
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
        if (elem && this.illegalTags.indexOf(elem.tagName) && !elem.classList.contains("rootModalExtractData")) {
            if (elem.dataset.mark === this.mark_train) {
                elem.dataset.mark = this.possible_del_mark_train;
            } else if (elem.dataset.mark === undefined){
                elem.dataset.mark = this.possible_mark_train;
            }
        }
    }

    mouseclickFunc(event) {
        let elem = event.target;
        if (elem && this.illegalTags.indexOf(elem.tagName) && !elem.classList.contains("rootModalExtractData")) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            event.preventDefault();
            if (elem.dataset.mark === this.possible_del_mark_train) {
                delete elem.dataset.mark;
                this.selectedElems.splice(this.selectedElems.indexOf(elem));
            } else if (elem.dataset.mark === this.mark_predict) {
                this.predictedElems.splice(this.predictedElems.indexOf(elem));
                elem.dataset.mark = this.mark_train;
                this.selectedElems.push(elem);
            } else {
                console.log("MARK ELEMENT_____");
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

    mouseclickOneElemFunc(event) {
        let elem = event.target;
        if (elem && this.illegalTags.indexOf(elem.tagName) && !elem.classList.contains("rootModalExtractData")) {
            event.stopPropagation();
            event.stopImmediatePropagation();
            event.preventDefault();
            if (elem.dataset.mark === this.possible_del_mark_train) {
                delete elem.dataset.mark;
                this.selectedElems.splice(this.selectedElems.indexOf(elem));
            } else if (elem.dataset.mark === this.possible_mark_train) {
                this.clearSelectedElems();
                elem.dataset.mark = this.mark_train;
                this.selectedElems.push(elem);
            }
            // TODO: может быть добавить сообщение о том удалился или добавился элменты (мб передавать кол-во вбыранных)
            document.dispatchEvent(new CustomEvent("selected", {}));
        }
    }

    mouseoutFunc(event) {
        let elem = event.target;
        if (elem && this.illegalTags.indexOf(elem.tagName) && !elem.classList.contains("rootModalExtractData")) {
            if (elem.dataset.mark === this.possible_del_mark_train || elem.dataset.mark === this.mark_train) {
                elem.dataset.mark = this.mark_train;
            } else if (elem.dataset.mark === this.possible_mark_train) {
                delete elem.dataset.mark;
            }
        }
    }

    start() {
        if (!this.isSingleElem) {
            document.body.addEventListener('click', this.mouseclickBind, true);
        } else {
            document.body.addEventListener('click', this.mouseclickOneElemBind, true);
        }
        document.body.addEventListener('mouseover', this.mouseoverBind, true);
        document.body.addEventListener('mouseout', this.mouseoutBind, true);
    }

    stop() {
        console.log("stop")
        if (!this.isSingleElem) {
            document.body.removeEventListener('click', this.mouseclickBind, true);
        } else {
            document.body.removeEventListener('click', this.mouseclickOneElemBind, true);
        }
        document.body.removeEventListener("mouseover", this.mouseoverBind, true);
        document.body.removeEventListener('mouseout', this.mouseoutBind, true);
        this.clearElems();
    }
}
