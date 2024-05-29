try {
   importScripts('./backgroundStorage.js', './Extractor.js', './Heap.js', './Tab.js');
} catch (e) {
   console.error(e);
}

class TaskManager {
    constructor() {
        this.tasks = [];
        let webExtractorDB = null;
        let extractor = {};
        let dataForDownload = [];
        let isStoppedExtract = false;
        let titles = ["Стартовая страница"];
    }

    addTask(task) {
        this.tasks.push(task);
        task.start();
    }

    async handleRequest(request, sendResponse) {
        switch(request.message) {
            case 'saveExtractor':
                webExtractorDB.setExtractor(request.extractor)
                    .then((res) => {
                        extractor = request.extractor;
                        extractor.extractorName = res;
                        console.log("saveExtractor ok 29");
                    });
                sendResponse({"message": "ok"});
                break;

            case 'getExtractors':
                webExtractorDB.getExtractors()
                    .then(res => {
                        console.log("getExtractors ok 37");
                        sendResponse({'extractors': res});
                    })
                break;

            case 'makeExtractorCurrent':
                webExtractorDB.getExtractor(request.extractorName)
                    .then((res) => {
                        console.log("makeExtractorCurrent ok 45");
                        extractor.extractorName = request.extractorName;
                        extractor.extractorStartUrl = res.extractorStartUrl;
                    });
                sendResponse({"my":"yuou"});
                break;

            case 'saveCollector':
                webExtractorDB.setCollector(Object.assign(request.collector, {'extractorName': extractor.extractorName}))
                    .then(res => {
                        console.log('SaveCollector(msg) setCollector(webExtractorDB) ' + res);
                    });
                break;

            case 'putCollector':
                webExtractorDB.putCollector(Object.assign(request.collector, {'extractorName': extractor.extractorName}))
                    .then(res => {
                        console.log('putCollector(msg) putCollector(webExtractorDB) ' + res);
                    });
                break;

            case 'savePageSample':
                webExtractorDB.setPageSample(Object.assign(request.pageSample, {'extractorName': extractor.extractorName}))
                    .then(res => {
                        console.log('putCollector(msg) setPageSample(webExtractorDB) ' + res);
                    });
                sendResponse({"my":"yuou"});
                console.log("Page Sample background " + request.pageSample);
                break;

            case 'getPageSamplesByExtractor':
                webExtractorDB.getPageSamplesByExtractor(extractor.extractorName)
                    .then((res) => {
                        console.log("getPageSamplesByExtractor ok 78");
                        sendResponse({message: "pageSamples", pageSamples: res});
                    })
                break;

            case 'download':
                isStoppedExtract  = isStoppedExtract !== true;
                if (dataForDownload.length > 0) {
                    let formattedData;
                    switch (request.format) {
                        case 'csv':
                            formattedData = saveToCSV(titles, dataForDownload, request.notIncludeColumns);
                            break;
                        case 'json':
                            formattedData = saveToJSON(titles, dataForDownload, request.notIncludeColumns);
                            break;
                    }
                    sendResponse({message: 'ok', formattedData: formattedData, extractorName: extractor.extractorName});
                    console.log("download ok 96");
                } else {
                    sendResponse({message: 'empty'});
                    console.error("download empty 99");
                }
                break;

            case 'extract':
                extractData(extractor.extractorName, [extractor.extractorStartUrl])
                    .then(data => sendResponse({ message: "ok", useData: data }))
                    .catch(err => {
                        sendResponse({ message: "error", error: err.toString() });
                        console.log(err);
                    });
                break;
            default:
                console.error("Unknown message type:", request.message);
                sendResponse({ message: "error", error: "Unknown message type" });
        }
    }
}

let webExtractorDB = null;
let extractor = {};
let dataForDownload = [];
let isStoppedExtract = false;
let titles = ["Стартовая страница"];

(function initIndexedDB() {
    webExtractorDB = new IndexedDBStorage();
})();

chrome.runtime.onInstalled.addListener(() => {
    webExtractorDB.connectDB(console.log);
});



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
   switch(request.message) {
      case 'saveExtractor':
          webExtractorDB.setExtractor(request.extractor)
             .then((res) => {
                  extractor = request.extractor;
                  extractor.extractorName = res;
                  console.log("saveExtractor ok 29");
            });
          sendResponse({"message": "ok"});
         break;

       case 'getExtractors':
           webExtractorDB.getExtractors()
               .then(res => {
                   console.log("getExtractors ok 37");
                   sendResponse({'extractors': res});
               })
           break;

       case 'makeExtractorCurrent':
           webExtractorDB.getExtractor(request.extractorName)
               .then((res) => {
                   console.log("makeExtractorCurrent ok 45");
                   extractor.extractorName = request.extractorName;
                   extractor.extractorStartUrl = res.extractorStartUrl;
               });
           sendResponse({"my":"yuou"});
           break;

       case 'saveCollector':
           webExtractorDB.setCollector(Object.assign(request.collector, {'extractorName': extractor.extractorName}))
               .then(res => {
                    console.log('SaveCollector(msg) setCollector(webExtractorDB) ' + res);
               });
         break;

      case 'putCollector':
          webExtractorDB.putCollector(Object.assign(request.collector, {'extractorName': extractor.extractorName}))
              .then(res => {
                  console.log('putCollector(msg) putCollector(webExtractorDB) ' + res);
              });
          break;

       case 'savePageSample':
           webExtractorDB.setPageSample(Object.assign(request.pageSample, {'extractorName': extractor.extractorName}))
               .then(res => {
                   console.log('putCollector(msg) setPageSample(webExtractorDB) ' + res);
               });
           sendResponse({"my":"yuou"});
           console.log("Page Sample background " + request.pageSample);
           break;

       case 'getPageSamplesByExtractor':
           webExtractorDB.getPageSamplesByExtractor(extractor.extractorName)
               .then((res) => {
                   console.log("getPageSamplesByExtractor ok 78");
                   sendResponse({message: "pageSamples", pageSamples: res});
               })
           break;

       case 'download':
           isStoppedExtract  = isStoppedExtract !== true;
            if (dataForDownload.length > 0) {
                let formattedData;
                switch (request.format) {
                    case 'csv':
                        formattedData = saveToCSV(titles, dataForDownload, request.notIncludeColumns);
                        break;
                    case 'json':
                        formattedData = saveToJSON(titles, dataForDownload, request.notIncludeColumns);
                        break;
                }
                sendResponse({message: 'ok', formattedData: formattedData, extractorName: extractor.extractorName});
                console.log("download ok 96");
            } else {
                sendResponse({message: 'empty'});
                console.error("download empty 99");
            }
           break;

       case 'extract':
           extractData(extractor.extractorName, [extractor.extractorStartUrl])
               .then(data => sendResponse({ message: "ok", useData: data }))
               .catch(err => {
                   sendResponse({ message: "error", error: err.toString() });
                   console.log(err);
               });
           console.log("extractorName " + extractor);
           console.log("extract ok 111 ");
           return true;
   }
   return true;
});



async function extractData(extractorName, urls) {
    // проход по ссылкам
        // определение класса страницы и получение схожей страницы
        // получаем коллекторы по странице
        // собираем данные со страницы используя коллекторы
    // инициализация кучи, объекты в куче имеют вид {...: ..., priority: priority}
    try {
        let priorityQueue = new Heap();
        let priority = 0;
        let urlsPrior = [];
        urls.forEach((url) => {
            urlsPrior.push({priority: priority, data: url, type: 'link'});
        });
        // Переопределение функции для сравнения(так что макс. элемент извлекается первее)
        priorityQueue.lessThan = (a, b) => a.priority < b.priority;
        priorityQueue.addElems(urlsPrior);

        // получение данных о сборщике с бд и сущностей связанных с полученным сборщиком
        let extractor = await webExtractorDB.getExtractor(extractorName);
        let [pageSamples, collectors] = await getDataByExtractor(extractor);

        // создание вкладки
        if (urls[0] === undefined) {
            console.error("arr 'urls' is empty");
        }

        let tab = new Tab();
        await tab.createTabFullLoad(urls[0]);

        // проход по очереди с приоритетом
        let currentData = [];
        let lastPrior = 0;
        let rowCount = 0;
        while (!priorityQueue.isEmpty() && !isStoppedExtract) {
            let current = priorityQueue.pop();

            if (current.type === 'link' || current.type === 'pagination_link') {
                await tab.goToUrl(current.data);
                let response = await tab.sendMessageToTab({
                    message: "extractData",
                    pageSamples: pageSamples,
                    collectors: collectors
                });
                console.log("ResponseMessage = " + response.message);
                console.log("ResponseUseData = " + response.useData);
                priority = current.priority;
                if (response.message === "ok") {
                    let priorityElems = [];
                    let basePriority = ++priority;

                    for (let i = 0; i < response.useData.length; ++i) {
                        let item = response.useData[i];
                        let currentPriority = item.type === 'pagination_link' ? basePriority : ++priority;

                        item.data.forEach((elem) => {
                            priorityElems.push({priority: currentPriority, data: elem, type: item.type});
                        });

                        if (!titles.includes(item.name)) {
                            titles.push(item.name);
                        }
                    }

                    priorityQueue.addElems(priorityElems);
                } else if (response.message === "update") {
                    webExtractorDB.setCollector(Object.assign(response.collector, {'extractorName': extractor.extractorName}));
                    webExtractorDB.setPageSample(Object.assign(response.pageSample, {'extractorName': extractor.extractorName}));
                    webExtractorDB.collectors.push(Object.assign(response.collector, {'extractorName': extractor.extractorName}));
                    webExtractorDB.pageSamples.push(Object.assign(response.pageSample, {'extractorName': extractor.extractorName}));
                } else if (response.message === "singleElemCollectorUpdate") {
                    let priorityElems = [];
                    let basePriority = ++priority;

                    for (let i = 0; i < response.useData.length; ++i) {
                        let item = response.useData[i];
                        let currentPriority = item.type === 'pagination_link' ? basePriority : ++priority;

                        item.data.forEach((elem) => {
                            priorityElems.push({priority: currentPriority, data: elem, type: item.type});
                        });

                        if (!titles.includes(item.name)) {
                            titles.push(item.name);
                        }
                    }
                    priorityQueue.addElems(priorityElems);
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
                    continue;
                } else {
                    console.log(response.message);
                }
            }

            if (lastPrior !== 0 && current.priority === 2) {
                dataForDownload.push([...currentData]);
                currentData.length = 0;
                rowCount++;
            }
            console.log(current);
            currentData[current.priority] = current.data;
            lastPrior = current.priority;
            console.log(priorityQueue);
        }
    } catch (err) {
        console.error("Error: {extractData}", err);
    }
}

async function getDataByExtractor(extractor) {
    let extractorName = extractor.extractorName;
    try {
        let requestsDB = [
            await  webExtractorDB.getPageSamplesByExtractor(extractorName),
            await  webExtractorDB.getCollectorsByExtractor(extractorName)
        ];
        return await Promise.all(requestsDB);
    } catch (err) {
        console.error("Error getting data by extractor:", err);
        throw err; // Повторное выбрасывание ошибки для обработки на верхнем уровне
    }
}

function endExtractNotification() {
    chrome.notifications.create({
        title: "Данные собраны",
        message: "Теперь ты можешь скачать их!",
        iconUrl: './img/prediction.png',
        type: "basic"
    });
}





