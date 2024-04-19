const NAME_DB = "WebExtractor";
const VERSION_DB = 1;

function loger(err){
    console.log(err);
}


function connectDB(func) {
    let openRequest = indexedDB.open(NAME_DB, 2);

    openRequest.onerror = loger;

    openRequest.onupgradeneeded = function (event) {
        console.log('onupgradenedeed');
        let db = event.currentTarget.result;
        if (!db.objectStoreNames.contains('pageSamples')) {
            let pageSamples = db.createObjectStore('pageSamples', {
                keyPath: ['target', 'extractorName']
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
                keyPath: 'collector_id', autoIncrement: true
            });
            collectors.createIndex('extractorName_idx', 'extractorName');
        }
        if (!db.objectStoreNames.contains('pageClassificators')) {
            let pageClassificators = db.createObjectStore('pageClassificators', {
                keyPath: 'pageClassificator_id', autoIncrement: true
            });
            pageClassificators.createIndex('extractorName_idx', 'extractorName');
        }

        connectDB(func);
    }

    openRequest.onsuccess = function (event) {
        let db = openRequest.result;

        db.onversionchange = function () {
            db.close();
            alert("База данных устарела, перезагрузите страницу.");
        }

        return func(db);
    }
}

function setCollector(collector) {
    return new Promise((resolve, reject) => {
        connectDB(function (db) {
            let request =
                db.transaction('collectors', 'readwrite').objectStore('collectors').add(collector);
            request.onerror = loger;
            request.onsuccess = function () {
                return resolve(request.result);
            }
        });
    });
}

function setDomain(domain) {
    return connectDB(function (db) {
        let request =
            db.transaction('domains', 'readwrite').objectStore('domains').add(domain);
        request.onerror = loger;
        request.onsuccess = function () {
            return request.result;
        }
    });
}

function setExtractor(extractor) {
    return new Promise((resolve, reject) => {
        connectDB(function (db) {
            let request =
                db.transaction('extractors', 'readwrite').objectStore('extractors').add(extractor);
            request.onerror = loger;
            request.onsuccess = function () {
                return resolve(request.result);
            }
        });
    });
}

function setPageClassificator(pageClassificator) {
    connectDB(function (db) {
        let request =
            db.transaction('pageClassificators', 'readwrite')
                .objectStore('pageClassificators')
                .add(pageClassificator);
        request.onerror = loger;
        request.onsuccess = function () {
            return request.result;
        }
    });
}

function setPageSample(pageSample) {
    console.log(pageSample);
    return new Promise((resolve, reject) => {
        connectDB(function (db) {
            let request =
                db.transaction('pageSamples', 'readwrite')
                    .objectStore('pageSamples')
                    .add(pageSample);
            request.onerror = loger;
            request.onsuccess = function () {
                return resolve(request.result);
            }
        });
    });
}

function getCollector(collector_id, func){
    connectDB(function(db){
        let request =
            db.transaction('collectors', "readonly").objectStore('collectors').get(collector_id);
        request.onerror = loger;
        request.onsuccess = function(){
            func(request.result ? request.result : -1);
        }
    });
}

function getDomain(domain_id, func){
    connectDB(function(db){
        let request =
            db.transaction('collectors', "readonly").objectStore('collectors').get(domain_id);
        request.onerror = loger;
        request.onsuccess = function(){
            func(request.result ? request.result : -1);
        }
    });
}

function getExtractor(extractorName) {
    return new Promise((resolve, reject) => {
        connectDB(function (db) {
            let request =
                db.transaction('extractors', "readonly")
                    .objectStore('extractors')
                    .get(extractorName);
            request.onerror = loger;
            request.onsuccess = function () {
                resolve(request.result ? request.result : -1);
            }
        });
    })
}

function getExtractors() {
    return new Promise((resolve, reject) => {
        connectDB(function(db){
            let request =
                db.transaction('extractors', "readonly")
                    .objectStore('extractors')
                    .getAll();
            request.onerror = loger;
            request.onsuccess = function(){
                resolve(request.result ? request.result : -1);
            }
        });
    });
}

function getExtractorByName(extractorName, func) {
    connectDB(function(db){
        let request =
            db.transaction('extractors', "readonly")
                .objectStore('extractors')
                .index('extractorName_idx')
                .get(extractorName);
        request.onerror = loger;
        request.onsuccess = function(){
            console.log(extractorName);
            console.log(request.result.extractor_id);
            func(request.result ? request.result : -1);
        }
    });
}

function getPageSamplesByExtractor(extractorName) {
    return new Promise((resolve, reject) => {
        connectDB(function(db){
            let request =
                db.transaction('pageSamples', "readonly")
                    .objectStore('pageSamples')
                    .index('extractorName_idx')
                    .getAll(extractorName);
            request.onerror = loger;
            request.onsuccess = function(){
                resolve(request.result ? request.result : -1);
            }
        });
    });
}

function getPageClassificatorByExtractor(extractor_id) {
    return new Promise((resolve, reject) => {
        connectDB(function(db){
            let request =
                db.transaction('pageClassificators', "readonly")
                    .objectStore('pageClassificators')
                    .index('extractorName_idx')
                    .get(extractor_id);
            request.onerror = loger;
            request.onsuccess = function(){
                return request.result ? request.result : -1;
            }
        });
    });
}

function getCollectorsByExtractor(extractorName) {
    return new Promise((resolve, reject) => {
        connectDB(function(db){
            let request =
                db.transaction('collectors', "readonly")
                    .objectStore('collectors')
                    .index('extractorName_idx')
                    .getAll(extractorName);
            request.onerror = loger;
            request.onsuccess = function(){
                resolve(request.result ? request.result : -1);
            }
        });
    });
}

