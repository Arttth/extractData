class Dataset {
    trainData = new Map();
    testData = [];
    targets = ["yes", "no"];
    features = [];

    predictedData = [];

    constructor(attrName, type, url) {
        this.attrName= attrName;
        this.type = type;
        this.url = url;
        console.log(attrName, type, url);
        this.classificator = new NaiveBayes();
        this.classificator.setTrainData(this.trainData);
        this.classificator.setTargets(this.targets);
        this.classificator.setTestData(this.testData);
    }

    setPredictedData(predictedData) {
        this.predictedData = predictedData;
    }

    getDatasetName() {
        return this.attrName;
    }

    getDatasetType() {
        return this.type;
    }

    getClassificator() {
        return this.classificator;
    }

    getTrainDatasetSize() {
        return this.trainData.size;
    }

    transformElemToSample(elem) {
        let sample = {};
        sample.features = {};
        sample.features.tagName = elem.nodeName;
        sample.features.countChildren = this.countChildren(elem);
        sample.features.level = this.level(elem);
        sample.features.nameClass = this.nameClass(elem);
        this.nameParent(elem).forEach((val, key) => {
            sample.features[key] = val;
        });
        // sample.features.style = this.style(elem);
        sample.target = "yes";
        return sample
    }

    saveTrainElem(elem, name) {
        console.log("saveTrainElem");
        console.log("elemTrain " + elem);
        let sample = this.transformElemToSample(elem);
        this.trainData.set(name, sample);
        console.log("this.trainData: " + this.trainData.size);
        document.dispatchEvent(new CustomEvent("datasetsave", {
            detail: elem
        }));
    }

    removeTrainElem(elem, name) {
        this.trainData.delete(name);
        console.log("this.trainData: " + this.trainData.size);
        document.dispatchEvent(new CustomEvent("datasetsave", {
            detail: elem
        }));
    }

    saveTestElems(elems) {
        for (let elem of elems) {
            let sample = this.transformElemToSample(elem);
            if (elem.classList.contains("markedDataElem")) {
                sample.target = "yes";
            } else {
                sample.target = "-";
                this.testData.push(sample);
            }
        }
    }



    // sendDataset() {
    //     chrome.runtime.sendMessage({msg: "dataset", trainData: this.trainData, testData: this.testData, targets: this.targets},  (response) => {
    //         if (response.response) {
    //             this.predictData = response.response;
    //             for (let i = 0; i < response.response.length; ++i) {
    //                 if (response.response[i].target === "yes") {
    //                     console.log(response.response[i]);
    //                 }
    //             }
    //             console.log("Length: " + response.response.length);
    //             // console.log("Response: " + response.response);
    //         } else {
    //             console.log("LOG: PREDICT DATA IS NOT RECEIVED");
    //         }
    //     });
    //     return this.predictData;
    // }

    nameClass(element) {
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
        return result
    }
    style(element) {
        let styles = window.getComputedStyle(element, null);
        let css = this.anyCss;
        let styleLen = css.length;
        let result = [];
        for (let i = 0; i < styleLen; i++) {
            let prop = css[i];
            let value = styles.getPropertyValue(prop);
            if (prop === 'font-family') {
                let arr = value.split(', ', 1);
                let font = arr[0].replace(/"/g, '');
                value = font;
            }
            result.push(value);
        }
        return result
    }
    // getTarget(element, datasetClassName) {
    //     let target = element.dataset[datasetClassName];
    //     if (target === undefined) { return 'NaN' }
    //     else { return target }
    // }
    countChildren(element) {
        let count = element.querySelectorAll('*').length;
        return count.toString()
    }
    level(element) {
        let level = 0;
        while (element.nodeName !== 'BODY') {
            element = element.parentNode;
            level++;
        }
        return level.toString()
    }
    nameParent(element) {
        let countParent = 10;
        let result = [];
        for (let i = 1; i <= countParent; i++) {
            let countPar = '';
            if (element.parentNode == null) {
                result.push("-1");
            } else {
                element = element.parentNode;
                countPar = element.nodeName;
                result.push(countPar);
            }
        }
        return result
    }
}