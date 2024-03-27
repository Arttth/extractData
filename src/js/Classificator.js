// интерфейс для классификатора
class Classificator {
    targets = [];
    dataset = {};
    constructor() {
    }
    setDataset(dataset) {
        this.testData = dataset.testData;
        this.trainData = dataset.trainData;
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