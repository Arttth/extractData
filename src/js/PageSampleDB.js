class PageSampleDB {
    static webExtractorDB = new IndexedDBStorage();

    static async savePageSample(pageSample) {
        return new Promise((resolve, reject) => {
            this.webExtractorDB.connectDB((db) => {
                let request =
                    db.transaction('pageSamples', 'readwrite')
                        .objectStore('pageSamples')
                        .add(pageSample);
                request.onerror = this.webExtractorDB.loger;
                request.onsuccess = function () {
                    resolve(request.result);
                }
            });
        });
    }

    static getPageSamplesByExtractor(extractorName) {
        return new Promise((resolve, reject) => {
            this.webExtractorDB.connectDB((db) => {
                let request =
                    db.transaction('pageSamples', "readonly")
                        .objectStore('pageSamples')
                        .index('extractorName_idx')
                        .getAll(extractorName);
                request.onerror = this.webExtractorDB.loger;
                request.onsuccess = function () {
                    resolve(request.result ? request.result : -1);
                }
            });
        });
    }

}