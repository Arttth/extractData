// интерфейс для классификатора
class Classificator {
    dataset = {};
    constructor() {
    }
    setDataset(dataset) {
        this.dataset = dataset;
    }

    getParams() {}
    fit() {}
    predict() {}
}