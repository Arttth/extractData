class CollectorDB {
    static webExtractorDB = new IndexedDBStorage();

    static async getCollectorsByExtractor(extractorName) {
        return new Promise((resolve, reject) => {
            this.webExtractorDB.connectDB((db) => {
                let request =
                    db.transaction('collectors', "readonly")
                        .objectStore('collectors')
                        .index('extractorName_idx')
                        .getAll(extractorName);

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


    static async putCollector(collector) {
        return new Promise((resolve, reject) => {
            this.webExtractorDB.connectDB((db) => {
                let request =
                    db.transaction('collectors', 'readwrite').objectStore('collectors').put(collector);

                request.onerror = () => {
                    this.webExtractorDB.loger(request.error); // Исправлено: this.loger на this.logger
                    reject(request.error); // Отправляем ошибку в reject
                };

                request.onsuccess = () => {
                    resolve(request.result);
                };
            });
        });
    }


    static async saveCollector(collector) {
        return new Promise((resolve, reject) => {
            this.webExtractorDB.connectDB((db) => {
                let request =
                    db.transaction('collectors', 'readwrite').objectStore('collectors').add(collector);

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

}