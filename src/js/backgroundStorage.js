class IndexedDBStorage {
    static instance;
    NAME_DB = "WebExtractor";
    VERSION_DB = 1;

    constructor() {
        if (IndexedDBStorage.instance) {
            return IndexedDBStorage.instance;
        }
        IndexedDBStorage.instance = this;
    }

    loger(err) {
        console.log(err);
    }


    connectDB(func) {
        let openRequest = indexedDB.open(this.NAME_DB, 1);

        openRequest.onerror = this.loger;

        openRequest.onupgradeneeded =  (event)  => {
            let db = event.currentTarget.result;
            if (!db.objectStoreNames.contains('pageSamples')) {
                let pageSamples = db.createObjectStore('pageSamples', {
                    keyPath: ['target', 'extractorName', 'url']
                });
                pageSamples.createIndex('extractorName_idx', 'extractorName');
            }
            if (!db.objectStoreNames.contains('extractors')) {
                let extractors = db.createObjectStore('extractors', {
                    keyPath: 'extractorName'
                });
                // extractors.createIndex('extractorName_idx', 'extractorName', {unique: false});
            }
            if (!db.objectStoreNames.contains('collectors')) {
                let collectors = db.createObjectStore('collectors', {
                    keyPath: ['collectorName', 'extractorName']
                });
                collectors.createIndex('extractorName_idx', 'extractorName');
            }

            this.connectDB(func);
        }

        openRequest.onsuccess =  (event) => {
            let db = openRequest.result;

            db.onversionchange = function () {
                db.close();
                alert("База данных устарела, перезагрузите страницу.");
            }

            return func(db);
        }
    }


    setCollector(collector) {
        return new Promise((resolve, reject) => {
            this.connectDB( (db) => {
                let request =
                    db.transaction('collectors', 'readwrite').objectStore('collectors').add(collector);
                request.onerror = this.loger;
                request.onsuccess = function () {
                    return resolve(request.result);
                }
            });
        });
    }

    putCollector(collector) {
        console.log(collector);
        return new Promise((resolve, reject) => {
            this.connectDB(function (db) {
                let request =
                    db.transaction('collectors', 'readwrite').objectStore('collectors').put(collector);
                request.onerror = this.loger;
                request.onsuccess = function () {
                    return resolve(request.result);
                }
            });
        });
    }


    setExtractor(extractor) {
        return new Promise((resolve, reject) => {
            this.connectDB((db) => {
                let request =
                    db.transaction('extractors', 'readwrite').objectStore('extractors').add(extractor);
                request.onerror = this.loger;
                request.onsuccess = function () {
                    return resolve(request.result);
                }
            });
        });
    }



    setPageSample(pageSample) {
        console.log(pageSample);
        return new Promise((resolve, reject) => {
            this.connectDB((db) => {
                let request =
                    db.transaction('pageSamples', 'readwrite')
                        .objectStore('pageSamples')
                        .add(pageSample);
                request.onerror = this.loger;
                request.onsuccess = function () {
                    return resolve(request.result);
                }
            });
        });
    }


    getPageSamplesByExtractor(extractorName) {
        return new Promise((resolve, reject) => {
            this.connectDB((db) => {
                let request =
                    db.transaction('pageSamples', "readonly")
                        .objectStore('pageSamples')
                        .index('extractorName_idx')
                        .getAll(extractorName);
                request.onerror = this.loger;
                request.onsuccess = function () {
                    resolve(request.result ? request.result : -1);
                }
            });
        });
    }



    getCollector(collectorName, func) {
        this.connectDB((db) => {
            let request =
                db.transaction('collectors', "readonly").objectStore('collectors').get(collectorName);
            request.onerror = this.loger;
            request.onsuccess = function () {
                func(request.result ? request.result : -1);
            }
        });
    }



    getExtractor(extractorName) {
        return new Promise((resolve, reject) => {
            this.connectDB((db) => {
                let request =
                    db.transaction('extractors', "readonly")
                        .objectStore('extractors')
                        .get(extractorName);
                request.onerror = this.loger;
                request.onsuccess = function () {
                    resolve(request.result ? request.result : -1);
                }
            });
        })
    }


    getExtractors() {
        return new Promise((resolve, reject) => {
            this.connectDB((db) => {
                let request =
                    db.transaction('extractors', "readonly")
                        .objectStore('extractors')
                        .getAll();
                request.onerror = this.loger;
                request.onsuccess = function () {
                    resolve(request.result ? request.result : -1);
                }
            });
        });
    }


    getCollectorsByExtractor(extractorName) {
        return new Promise((resolve, reject) => {
            this.connectDB((db) => {
                let request =
                    db.transaction('collectors', "readonly")
                        .objectStore('collectors')
                        .index('extractorName_idx')
                        .getAll(extractorName);
                request.onerror = this.loger;
                request.onsuccess = function () {
                    resolve(request.result ? request.result : -1);
                }
            });
        });
    }

}