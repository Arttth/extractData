try {
   importScripts('./backgroundStorage.js', './Extractor.js');
} catch (e) {
   console.error(e);
}
chrome.runtime.onInstalled.addListener(() => {
   connectDB(console.log);
});

let extractor = {};
let pageClassificator = {};
let collectors = [];
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
          sendResponse({"my":"yuou"});
         break;
      case 'saveCollector':
         setCollector(Object.assign(request.collector, {'extractorName': extractor.extractorName}));
         break;
      case 'getExtractors':
         getExtractors()
             .then(res => {
                sendResponse({'extractors': res});
             })
         break;
      case 'makeExtractorCurrent':
         extractor.extractorName = request.extractorName;
          sendResponse({"my":"yuou"});
         break;
      case 'extract':
         extractData(extractor.extractorName, ['https://www.mvideo.ru/noutbuki-planshety-komputery-8/noutbuki-118?from=under_search\\',
         'https://learn.javascript.ru/promise-api']);
         console.log("extractorName " + extractor.extractorName);
         sendResponse({"my":"yuou"});
         break;
       case 'savePageSample':
           setPageSample(Object.assign(request.pageSample, {'extractorName': extractor.extractorName}));
           sendResponse({"my":"yuou"});
           console.log("Page Sample background " + request.pageSample);
           break;
   }
   return true;
});

// получить данные с бд
async function extractData(extractorName, urls) {
    // проход по ссылкам
        // определение класса страницы и получение схожей страницы
        // получаем коллекторы по странице
        // собираем данные со страницы используя коллекторы
   let extractedData = [];
   let extractor = await getExtractor(extractorName);
   let requestsDB = [
       await getPageSamplesByExtractor(extractorName),
       await getCollectorsByExtractor(extractorName)
   ];
   let [pageSamples, collectors] = await Promise.all(requestsDB);
   if (urls[0] === undefined) {
       //
       return "error";
   }
   let tab = await createTab(urls[0]);
    for (let i = 0; i < urls.length; ++i) {
        await goToUrl(tab, urls[i])
        // let response = await sendMessageToActiveTab({message: "extractData", pageSamples: pageSamples, collectors: collectors});
        let response = await chrome.tabs.sendMessage(tab.id, {message: "extractData", pageSamples: pageSamples, collectors: collectors});
        console.log(response.message);
        console.log(response.useData);
        if (response.message === "ok") {
            console.log("CSV = " + saveToCSV(response.useData));
        }
    }

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