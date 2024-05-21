// интерфейс для классификатора
class Classificator {
    dataset = {};
    constructor() {
    }
    setDataset(dataset) {
        this.dataset = dataset;
    }

    setTestData(testData) {
        this.testData = testData;
    }

    // getParams() {}
    fit() {}
    predict() {}
}