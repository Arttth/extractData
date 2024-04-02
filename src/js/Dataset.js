class Dataset {
    trainData = [];
    testData = [];
    targets = ["yes", "no"];
    features = [];

    // TODO: maybe delete
    //predictedData = [];

    constructor() {
    }

    setTargets(targets) {
        this.targets = targets;
    }

    setData(trainData, testData) {
        this.trainData = trainData;
        this.testData = testData;
    }

    setTrainData(trainData) {
        this.trainData = trainData;
    }

    setTestData(testData) {
        this.testData = testData;
    }

    saveTrainObj(obj) {
        if (obj) {
            this.trainData.push(obj);
        }
    }

    saveTestObj(obj) {
        if (obj) {
            this.testData.push(obj);
        }
    }

    // TODO: maybe delete
    // setPredictedData(predictedData) {
    //     this.predictedData = predictedData;
    // }


    getTrainDatasetSize() {
        return this.trainData.size;
    }

    saveTrainElem(elem) {
        let sample = this.transformElemToSample(elem);
        this.trainData.push(sample);
        // document.dispatchEvent(new CustomEvent("datasetsave", {
        //     detail: elem
        // }));
    }

    removeTrainElem(elem, name) {
        this.trainData.delete(name);
        document.dispatchEvent(new CustomEvent("datasetsave", {
            detail: elem
        }));
    }

    // saveTestElems(elems) {
    //     for (let elem of elems) {
    //         let sample = this.transformElemToSample(elem);
    //         if (elem.classList.contains("markedDataElem")) {
    //             sample.target = "yes";
    //         } else {
    //             sample.target = "-";
    //             this.testData.push(sample);
    //         }
    //     }
    // }



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

}