class Marker {
    illegalTags = ["DIV", "FORM"];
    illegalClasses = ["modal_title", "modal_data"];
    markClassName = "markedDataElem";
    possibleMarkClassName = "possibleMarkedDataElem";
    possibleDelMarkClassName = "possibleDelMarkedDataElem";
    similarClassName = "similarDataElem";
    dataset = null;

    setDataset(dataset) {
        this.dataset = dataset;
    }

    addIllegalTag(illegalTag) {
        this.illegalTags.push(illegalTag);
    }
    markPossibleElem(elem) {
        if (elem && this.illegalTags.indexOf(elem.tagName) && this.illegalClasses.indexOf(elem.className)) {
            if (elem.classList.contains(this.markClassName)) {
                elem.classList.add(this.possibleDelMarkClassName);
            } else {
                elem.classList.add(this.possibleMarkClassName);
            }
        }
    }

    delMarkPossibleElem(elem) {
        if (elem && this.illegalTags.indexOf(elem.tagName)) {
            if (elem.classList.contains(this.markClassName)) {
                elem.classList.remove(this.possibleDelMarkClassName);
            } else {
                elem.classList.remove(this.possibleMarkClassName);
            }
        }
    }

    markTrainElem(elem) {
        console.log("MARK");
        if (elem && this.illegalTags.indexOf(elem.tagName)) {
            if (elem.classList.contains(this.possibleMarkClassName)) {
                elem.classList.remove(this.possibleMarkClassName);
            }

            if (elem.classList.contains(this.possibleDelMarkClassName)) {
                elem.classList.remove(this.possibleDelMarkClassName);
            }
            // если элемент помечен, то удаляем, иначе помечаем
            if (elem.classList.contains(this.markClassName)) {
                elem.classList.remove(this.markClassName);
                let name = elem.dataset.nameid;
                this.dataset.removeTrainElem(name);
            } else {
                elem.classList.add(this.markClassName);
                let name = this.dataset.getDatasetName() + Math.random();
                this.dataset.saveTrainElem(elem, name);
                elem.dataset.nameid = name;
            }
        }
    }

    delMarkTrainElem(elem) {
        if (elem && this.illegalTags.indexOf(elem.tagName)) {
            if (elem.classList.contains(this.possibleMarkClassName)) {
                elem.classList.remove(this.possibleMarkClassName);
            }

            if (elem.classList.contains(this.possibleDelMarkClassName)) {
                elem.classList.remove(this.possibleDelMarkClassName);
            }

        }
    }

    clearMarks() {
        document.querySelectorAll("." + this.markClassName).forEach(elem => {
            elem.classList.remove(this.markClassName);
        });
        document.querySelectorAll("." + this.similarClassName).forEach(elem => {
            elem.classList.remove(this.similarClassName);
        });
    }

    markSimilarElements(elems) {
        elems.forEach((elem) => {
            elem.classList.append(this.similarClassName);
        });
    }
}