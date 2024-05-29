try {
   importScripts('./backgroundStorage.js', './Extractor.js', './Heap.js');
} catch (e) {
   console.error(e);
}
chrome.runtime.onInstalled.addListener(() => {
   connectDB(console.log);
});

let isStoppedExtract = false;

let extractor = {};
let dataForDownload = [];
let titles = ["Стартовая страница"];
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

       case 'saveCollector':
         setCollector(Object.assign(request.collector, {'extractorName': extractor.extractorName}));
         break;

      case 'putCollector':
          putCollector(Object.assign(request.collector, {'extractorName': extractor.extractorName}));
          break;

       case 'savePageSample':
           setPageSample(Object.assign(request.pageSample, {'extractorName': extractor.extractorName}));
           sendResponse({"my":"yuou"});
           console.log("Page Sample background " + request.pageSample);
           break;

       case 'getPageSamplesByExtractor':
           getPageSamplesByExtractor(extractor.extractorName)
               .then((res) => {
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
            } else {
                sendResponse({message: 'empty'});
            }
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
        // переопрделение функции для сравнения(так что макс. элемент извлекается первее)
        priorityQueue.lessThan = (a, b) => a.priority < b.priority;
        priorityQueue.addElems(urlsPrior);

        // получение данных о сборщике с бд и сущностей связанных с полученным сборщиком
        let extractor = await getExtractor(extractorName);
        let [pageSamples, collectors] = await getDataByExtractor(extractor);

        // создание вкладки
        if (urls[0] === undefined) {
            console.error("arr 'urls' is empty");
        }
        let tab = await createTab(urls[0]);

        // проход по очереди с приоритетом
        let currentData = [];
        let lastPrior = 0;
        let rowCount = 0;
        while (!priorityQueue.isEmpty() && !isStoppedExtract) {
            let current = priorityQueue.pop();

            if (current.type === 'link' || current.type === 'pagination_link') {
                await goToUrl(tab, current.data);
                let response = await chrome.tabs.sendMessage(tab.id, {
                    message: "extractData",
                    pageSamples: pageSamples,
                    collectors: collectors
                });
                console.log(response.message);
                console.log(response.useData);
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
                    setCollector(Object.assign(response.collector, {'extractorName': extractor.extractorName}));
                    setPageSample(Object.assign(response.pageSample, {'extractorName': extractor.extractorName}));
                    collectors.push(Object.assign(response.collector, {'extractorName': extractor.extractorName}));
                    pageSamples.push(Object.assign(response.pageSample, {'extractorName': extractor.extractorName}));
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
            await getPageSamplesByExtractor(extractorName),
            await getCollectorsByExtractor(extractorName)
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
