class ExtractorDB {
    static webExtractorDB = new IndexedDBStorage();
    static async saveExtractor(extractor) {
        return new Promise((resolve, reject) => {
            this.webExtractorDB.connectDB((db) => {
                let request =
                    db.transaction('extractors', 'readwrite')
                        .objectStore('extractors')
                        .add(extractor);

                request.onerror = () => {
                    this.webExtractorDB.loger(request.error);
                    reject(request.error);
                };

                request.onsuccess = () => {
                    resolve(request.result);
                };
            });
        });
    }


    static async getAllExtractors() {
        return new Promise((resolve, reject) => {
            this.webExtractorDB.connectDB((db) => {
                let request =
                    db.transaction('extractors', "readonly")
                        .objectStore('extractors')
                        .getAll();

                request.onerror = () => {
                    this.webExtractorDB.loger(request.error);
                    reject(request.error);
                };

                request.onsuccess = () => {
                    resolve(request.result ? request.result : -1);
                };
            });
        });
    }


    static async getExtractor(extractorName) {
        return new Promise((resolve, reject) => {
            this.webExtractorDB.connectDB((db) => {
                let request =
                    db.transaction('extractors', "readonly")
                        .objectStore('extractors')
                        .get(extractorName);

                request.onerror = () => {
                    this.loger(request.error);
                    reject(request.error);
                };

                request.onsuccess = () => {
                    resolve(request.result ? request.result : -1);
                };
            });
        });
    }

}