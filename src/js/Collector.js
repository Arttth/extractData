class Collector {
    name = "";
    type = "text";
    classificator = {};
    url = "";
    dataset = {};
    constructor(dataset, classificator) {
        this.dataset = dataset;
        this.classificator = classificator;

    }

    setName(name) {
        this.name = name;
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
}