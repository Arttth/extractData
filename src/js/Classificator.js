// интерфейс для классификатора
class Classificator {
    targets = [];
    dataset = {};
    constructor() {
    }
    setDataset(dataset) {
        // this.testData = dataset.testData;
        // this.trainData = dataset.trainData;
        this.dataset = dataset;
    }

    setTestData(testData) {
        this.testData = testData;
    }

    setTargets(targets) {
        this.targets = targets;
    }
    // getParams() {}
    train() {}
    classify() {}
    loadTrainData() {}
    loadData() {}
}