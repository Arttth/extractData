const NAME_DB = "WebExtractor";
const VERSION_DB = 1;

function loger(err){
   console.log(err);
}


function connectDB(func) {
   let openRequest = indexedDB.open(NAME_DB, 4);

   openRequest.onerror = loger;

   openRequest.onupgradeneeded = function (event) {
      let db = event.currentTarget.result;
      if (!db.objectStoreNames.contains('domains')) {
         db.createObjectStore('domains', {keyPath: 'domain_id', autoIncrement: true});
      }
      if (!db.objectStoreNames.contains('extractors')) {
         let extractors = db.createObjectStore('extractors', {
            keyPath: 'extractor_id', autoIncrement: true
         });
         extractors.createIndex('extractorName_idx', 'extractorName', {unique: false});
      }
      if (!db.objectStoreNames.contains('collectors')) {
         db.createObjectStore('collectors', {keyPath: 'collector_id', autoIncrement: true});
      }
      if (!db.objectStoreNames.contains('pageClassificators')) {
         let pageClassificators = db.createObjectStore('pageClassificators', {
            keyPath: 'pageClassificator_id', autoIncrement: true
         });
         pageClassificators.createIndex('extractor_idx', 'extractor_id');
      }

      connectDB(func);
   }

   let db = openRequest.result;
   db.onversionchange = function () {
      db.close();
      alert("База данных устарела, перезагрузите страницу.");
   }

   openRequest.onsuccess = function (event) {
      func(openRequest.result);
   }
}

function setCollector(collector) {
   connectDB(function (db) {
      let request =
          db.transaction('collectors', 'readwrite').objectStore('collectors').add(collector);
      request.onerror = loger;
      request.onsuccess = function () {
         return request.result;
      }
   });
}

function setDomain(domain) {
   connectDB(function (db) {
      let request =
          db.transaction('domains', 'readwrite').objectStore('domains').add(domain);
      request.onerror = loger;
      request.onsuccess = function () {
         return request.result;
      }
   });
}

function setExtractor(extractor) {
   return connectDB(function (db) {
      let request =
          db.transaction('extractors', 'readwrite').objectStore('extractors').add(extractor);
      request.onerror = loger;
      request.onsuccess = function () {
         return request.result;
      }
   });
}

function setPageClassificator(pageClassificator) {
   connectDB(function (db) {
      let request =
          db.transaction('pageClassificators', 'readwrite').objectStore('pageClassificators').add(pageClassificator);
      request.onerror = loger;
      request.onsuccess = function () {
         return request.result;
      }
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

function getExtractor(extractor_id, func){
   connectDB(function(db){
      let request =
          db.transaction('extractors', "readonly")
              .objectStore('extractors')
              .get(extractor_id);
      request.onerror = loger;
      request.onsuccess = function(){
         func(request.result ? request.result : -1);
      }
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
         func(request.result ? request.result : -1);
      }
   });
}

function getPageClassificatorByExtractor(extractor_id, func) {
   connectDB(function(db){
      let request =
          db.transaction('pageClassificators', "readonly")
              .objectStore('pageClassificators')
              .index('extractor_idx')
              .get(extractor_id);
      request.onerror = loger;
      request.onsuccess = function(){
         func(request.result ? request.result : -1);
      }
   });
}

function getCollectorsByExtractor(extractor_id, func) {
   connectDB(function(db){
      let request =
          db.transaction('collectors', "readonly")
              .objectStore('collectors')
              .index('extractor_idx')
              .getAll(extractor_id);
      request.onerror = loger;
      request.onsuccess = function(){
         func(request.result ? request.result : -1);
      }
   });
}


chrome.runtime.onInstalled.addListener(() => {
   connectDB(console.log);
});

let extractor = {};
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
   switch(request.msg) {
      case 'saveDomain':
         setDomain(request.domain);
         break;
      case 'saveExtractor':
         console.log("saveExtractor " + setExtractor(request.extractor));
         getExtractorByName(request.extractor.extractorName, function (extractorDB) {
            extractor = extractorDB;
         });
         console.log(extractor);
         break;
      case 'saveCollector':
         setCollector(Object.assign(request.collector, {'extractor_id': extractor.extractor_id}));
         break;
   }
});

// получить данные с бд
function extractData(extractorName, urls) {
   let extractedData = [];
   let collectors, domain, extractor, pageClassificator;
   getExtractorByName(extractorName, function (extractorDB) {
      extractor = extractorDB;
   });
   getPageClassificatorByExtractor(extractor.extractor_id, function (pageClassificatorDB) {
      pageClassificator = pageClassificatorDB;
   });
   getCollectorsByExtractor(extractor.extractor_id, function (collectorsDB) {
      collectors = collectorsDB;
   });
   getDomain(extractor.domain_id, function (domainDB) {
      domain = domainDB;
   });
   console.log("DATA");
   console.log(collectors);
   console.log(domain);
   console.log(extractor);
   console.log(pageClassificator);
   createTab(domain.url);
   // проходя по всем ссылкам, передаем на текущую вкладку ссылку и
  for (let url of urls) {
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
         chrome.tabs.sendMessage(tabs[0].id, {msg: "extractDataFromURL", 'url': url, 'pageClassificator': pageClassificator}, function(response) {
            if (response.predictedUrl !== undefined) {
               chrome.tabs.sendMessage(tabs[0].id, {msg: '',
               });
            }
        });
     });
  }
}

function createTab(url) {
   const tabLoadingTrap = { tabId: undefined, resolve: undefined };

   chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (tabId === tabLoadingTrap.tabId && changeInfo.status === 'complete') {
         tabLoadingTrap.resolve();

         Object.assign(tabLoadingTrap, { tabId: undefined, resolve: undefined });
      }
   });

   (async () => {
      const tab = await chrome.tabs.create({ url });
      await waitForTabLoadingToComplete(tab.id);
      const response = await chrome.tabs.sendMessage(tab.id, { msg: 'newTabForExtract' });
      console.log(response);
   })();

   function waitForTabLoadingToComplete(tabId) {
      tabLoadingTrap.tabId = tabId;

      return new Promise((resolve) => {
         tabLoadingTrap.resolve = resolve;
      });
   }
}