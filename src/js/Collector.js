class Collector {
    name = "";
    type = "text";
    classificator = {};
    url = "";
    dataset = {};
    isSingleElemCollector = false;

    constructor(dataset, classificator) {
        this.dataset = dataset;
        this.classificator = classificator;
        this.classificator.setDataset(this.dataset);
    }

    setName(name) {
        this.name = name;
    }

    setSingleElemCollector(boolOneEl) {
        this.isSingleElemCollector = boolOneEl;
    }

    setType(type) {
        this.type = type;
    }

    setURL(url) {
        this.url = url;
    }

    setClassificator(classificator) {
        this.classificator = classificator;
    }

    setDataset(dataset) {
        this.dataset = dataset;
    }

    getDataset() {
        return this.dataset;
    }

    getClassificator() {
        return this.classificator;
    }

    getOneElementSelector() {
        return this.isSingleElemCollector;
    }

    getPredictedElems() {

    }
}