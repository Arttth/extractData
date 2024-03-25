class Classificator {
    targets = [];
    constructor() {
    }
    setTrainData(trainData) {
        this.trainData = trainData;
    }

    setTestData(testData) {
        this.testData = testData;
    }

    setTargets(targets) {
        this.targets = targets;
    }
    train() {}
    classify() {}
    loadTrainData() {}
    loadData() {}
}