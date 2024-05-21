try {
   importScripts('./backgroundStorage.js', './Extractor.js', './Heap.js');
} catch (e) {
   console.error(e);
}
chrome.runtime.onInstalled.addListener(() => {
   connectDB(console.log);
});

let extractor = {};
let pageClassificator = {};
let collectors = [];
let csv = [];
let dataForDownload = [];
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("BACKGROUND MSG");
    console.log(request.message);
   switch(request.message) {
      case 'saveExtractor':
         setExtractor(request.extractor)
             .then((res) => {
                  extractor = request.extractor;
                  extractor.extractorName = res;
            });
          sendResponse({"message": "ok"});
         break;

      case 'saveCollector':
         setCollector(Object.assign(request.collector, {'extractorName': extractor.extractorName}));
         break;

      case 'putCollector':
          putCollector(Object.assign(request.collector, {'extractorName': extractor.extractorName}));
          break;

      case 'getExtractors':
         getExtractors()
             .then(res => {
                sendResponse({'extractors': res});
             })
         break;
      case 'makeExtractorCurrent':
         getExtractor(request.extractorName)
             .then((res) => {
                 extractor.extractorName = request.extractorName;
                 extractor.extractorStartUrl = res.extractorStartUrl;
             });
          sendResponse({"my":"yuou"});
         break;
      case 'extract':
         extractData(extractor.extractorName, [extractor.extractorStartUrl])
             .then(data => sendResponse({ message: "ok", useData: data }))
             .catch(err => {
                 sendResponse({ message: "error", error: err.toString() });
                 console.log(err);
             });
         console.log("extractorName " + extractor.extractorStartUrl);
         return true;

       case 'savePageSample':
           setPageSample(Object.assign(request.pageSample, {'extractorName': extractor.extractorName}));
           sendResponse({"my":"yuou"});
           console.log("Page Sample background " + request.pageSample);
           break;

       case 'download':
            if (dataForDownload.length > 0) {
                switch (request.format) {
                    case 'csv':
                        sendResponse({message: 'ok', data: saveToCSV(dataForDownload)});
                        break;
                }
            } else {
                console.log("data is empty");
            }
           break;
       case 'getPerformanceData':
           sendResponse({ message: "performanceData", data: performanceData });
           break;
       case 'getPageSamplesByExtractor':
           getPageSamplesByExtractor(extractor.extractorName)
               .then((res) => {
                   sendResponse({message: "pageSamples", pageSamples: res});
               })
           break;
   }
   return true;
});

function getQueueObj(priority, data, type) {

}

// получить данные с бд
async function extractData(extractorName, urls) {
    // проход по ссылкам
        // определение класса страницы и получение схожей страницы
        // получаем коллекторы по странице
        // собираем данные со страницы используя коллекторы
    // инициализация кучи, объекты в куче имеют вид {...: ..., priority: priority}
   let extractedData = [];
   let priorityQueue = new Heap();
   let priority = 0;
   // let urlsPrior = makeObjPriority(arrOfElemToArrOfObj(urls, "url"), priority);
    let urlsPrior = [];
    urls.forEach((url) => {
      urlsPrior.push({priority: priority, data: url, type: 'link'});
    });
   // переопрделение функции для сравнения(так что макс. элемент извлекается первее)
   priorityQueue.lessThan = (a, b) => a.priority < b.priority;
   priorityQueue.addElems(urlsPrior);

   // получение данных об экстракторе с бд
   let extractor = await getExtractor(extractorName);
   let requestsDB = [
       await getPageSamplesByExtractor(extractorName),
       await getCollectorsByExtractor(extractorName)
   ];
   let [pageSamples, collectors] = await Promise.all(requestsDB);

   // проход по страницам, используя кучу
   if (urls[0] === undefined) {
       console.error("arr 'urls' is empty");
   }
   let tab = await createTab(urls[0]);
   let currentData = [];
   let titles = ["Стратовая страница"];
   let lastPrior = 0;
   let rowCount = 0;
   let maxPrior = 0;
   while (!priorityQueue.isEmpty()) {
       let current = priorityQueue.pop();
       if (current.priority > maxPrior) {
           maxPrior = current.priority;
       }

       if (current.type === 'link') {
           await goToUrl(tab, current.data);
           let response = await chrome.tabs.sendMessage(tab.id, {message: "extractData", pageSamples: pageSamples, collectors: collectors});
           console.log(response.message);
           console.log(response.useData);
           if (response.message === "ok") {
               priority = current.priority;
               for (let i = 0; i < response.useData.length; ++i) {
                   let objs = [];
                   priority++;
                   response.useData[i].data.forEach((elem) => {
                       objs.push({priority: priority, data: elem, type: response.useData[i].type});
                   });
                   priorityQueue.addElems(objs);
               }
           } else if (response.message === "update") {
               setCollector(Object.assign(response.collector, {'extractorName': extractor.extractorName}));
               setPageSample(Object.assign(response.pageSample, {'extractorName': extractor.extractorName}));
               collectors.push(Object.assign(response.collector, {'extractorName': extractor.extractorName}));
               pageSamples.push(Object.assign(response.pageSample, {'extractorName': extractor.extractorName}));
           } else if (response.message === "singleElemCollectorUpdate") {
               priority = current.priority;
               for (let i = 0; i < response.useData.length; ++i) {
                   let objs = [];
                   priority++;
                   response.useData[i].data.forEach((elem) => {
                       objs.push({priority: priority, data: elem, type: response.useData[i].type});
                   });
                   priorityQueue.addElems(objs);
               }
               response.collectors.forEach(collector => {
                  putCollector(Object.assign(collector, {'extractorName': extractor.extractorName}));
                   for (let i = 0; i < collectors.length; ++i) {
                       if (collectors[i].collectorName === collector.collectorName &&
                           collectors[i].pageSampleName === collector.pageSampleName) {
                           collectors[i] = collector;
                       }
                   }
               });
           } else if (response.message === "continue") {
               console.log("CONTINUE");
           } else {
               console.log(response.message);
           }
       } else {
           if (maxPrior <= lastPrior) {
               dataForDownload[rowCount] = Array.from(currentData);
               rowCount++;
           }
           console.log(current);
           currentData[current.priority] = current.data;
           lastPrior = current.priority;
           console.log(priorityQueue);
       }
   }
   console.log("rowCount = " + rowCount);
   console.log("dataForDownload = " + dataForDownload);
}

function makeObjPriority(objs, priority) {
    let objsPrior = [];
    for (let i = 0; i < objs.length; ++i) {
        objsPrior.push(Object.assign(objs[i], {priority: priority}));
    }
    return objsPrior;
}

function arrOfElemToArrOfObj(elems, name) {
    let objs = [];
    for (let i = 0; i < elems.length; ++i) {
        objs.push({[name]: elems[i]});
    }
    return objs;
}

function goToUrl(tab, url) {
    chrome.tabs.update(tab.id, {url});
    return new Promise((resolve) => {
        chrome.tabs.onUpdated.addListener(function onUpdated(tabId, info)  {
            if (tabId === tab.id && info.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(onUpdated);
                resolve();
            }
        })
    })
}

async function sendMessageToActiveTab(message) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    console.log(tab);
    console.log(tab.id);
    return await chrome.tabs.sendMessage(tab.id, message);
}

async function createTab(url) {
   const tabLoadingTrap = { tabId: undefined, resolve: undefined };

   chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (tabId === tabLoadingTrap.tabId && changeInfo.status === 'complete') {

         tabLoadingTrap.resolve();

         Object.assign(tabLoadingTrap, { tabId: undefined, resolve: undefined });
      }
   });

    function waitForTabLoadingToComplete(tabId) {
        tabLoadingTrap.tabId = tabId;
        console.log("tabid" + tabId);

        return new Promise((resolve) => {
            tabLoadingTrap.resolve = resolve;
        });
    }

   const tab = await chrome.tabs.create({ url });
   await waitForTabLoadingToComplete(tab.id);
   return tab;
}