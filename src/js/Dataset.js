class Dataset {
    trainData = [];
    testData = [];
    targets = [];
    features = [];

    constructor() {
    }

    setTargets(targets) {
        this.targets = targets;
    }

    setData(trainData, testData) {
        this.setTrainData(trainData);
        this.setTestData(testData);
    }

    setTrainData(trainData) {
        this.trainData = trainData;
        this.addTargetsFromTrainData(trainData);
    }

    setTestData(testData) {
        this.testData = testData;
    }

    addTargetIfNotAdded(target) {
        if (target && this.targets.indexOf(target) < 0) {
            this.targets.push(target);
        }
    }

    addTargetsFromTrainData(trainData) {
        for (let i  = 0; i < trainData.length; ++i) {
            this.addTargetIfNotAdded(trainData[i].target);
        }
    }

    addTrainSample(trainSample) {
        if (trainSample) {
            this.trainData.push(trainSample);
            this.addTargetIfNotAdded(trainSample.target);
        }
    }

    addTestSample(testSample) {
        if (testSample) {
            this.testData.push(testSample);
        }
    }

    getTrainDatasetSize() {
        return this.trainData.size;
    }
}