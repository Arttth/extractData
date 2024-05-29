try {
    importScripts('./backgroundStorage.js',
        './Extractor.js', './Heap.js',
        './Tab.js', './ExtractorDB.js',
        './CollectorDB.js', './PageSampleDB.js');
} catch (e) {
    console.error(e);
}

class TaskManager {
    constructor() {
        this.tasks = [];
        this.extractor = {};
        this.dataForDownload = [];
        this.titles = ["Стартовая страница"];
    }

    addTask(task) {
        this.tasks.push(task);
        task.start();
    }

    getTaskById(taskId) {
        const task = this.tasks.find(task => task.getTaskId().toString() === taskId);
        if (task) {
            console.log('getTaskById');
        }
        return task;
    }

    async handleRequest(request, sendResponse) {
        try {
            switch (request.message) {
                case 'saveExtractor':
                    this.extractor = await ExtractorDB.saveExtractor(request.extractor);
                    sendResponse({"message": "saveExtractor"});
                    break;

                case 'getExtractors':
                    let extractors = await ExtractorDB.getAllExtractors();
                    sendResponse({extractors: extractors});
                    break;

                case 'makeExtractorCurrent':
                    this.extractor = await ExtractorDB.getExtractor(request.extractorName);
                    sendResponse({"message": "makeExtractorCurrent"});
                    break;

                case 'saveCollector':
                    if (this.extractor.extractorName) {
                        let response = await CollectorDB.saveCollector(request.collector, {'extractorName': this.extractor.extractorName});
                        console.log('SaveCollector(msg) setCollector(webExtractorDB) ' + response);
                        sendResponse({'message': 'ok'});
                    } else {
                        sendResponse({'message': 'bad'});
                        console.error('saveCollector: extractorName is ' + this.extractor.extractorName);
                    }
                    break;

                case 'putCollector':
                    if (this.extractor.extractorName) {
                        let response = await CollectorDB.putCollector(request.collector, {'extractorName': this.extractor.extractorName});
                        console.log('putCollector(msg) putCollector(webExtractorDB) ' + response);
                        sendResponse({'message': 'ok'});
                    } else {
                        sendResponse({'message': 'bad'});
                        console.error('saveCollector: extractorName is ' + this.extractor.extractorName);
                    }
                    break;

                case 'savePageSample':
                    if (this.extractor.extractorName) {
                        let response = await PageSampleDB.savePageSample(request.pageSample, {'extractorName': this.extractor.extractorName});
                        console.log('savePageSample(msg) savePageSample(webExtractorDB) ' + response);
                        sendResponse({'message': 'ok'});
                    } else {
                        sendResponse({'message': 'bad'});
                        console.error('savePageSample: extractorName is ' + this.extractor.extractorName);
                    }
                    break;

                case 'getPageSamplesByExtractor':
                    if (this.extractor.extractorName) {
                        let response = await PageSampleDB.getPageSamplesByExtractor(this.extractor.extractorName);
                        console.log('getPageSamplesByExtractor(msg) getPageSamplesByExtractor(webExtractorDB) ' + response);
                        sendResponse({message: "pageSamples", pageSamples: response});
                    } else {
                        sendResponse({message: 'pageSamples', pageSamples: []});
                    }
                    break;
                case 'getTasks':
                    let tasksDTO = [];
                    this.tasks.forEach((task) => {
                        tasksDTO.push({
                            extractorName: task.extractorName,
                            urls: task.urls,
                            taskId: task.getTaskId()
                        });
                    })
                    sendResponse({'message': 'tasks', tasksDTO: tasksDTO});
                    break;
                case 'download':
                    await this.handleDownload(request, sendResponse);
                    break;

                case 'extract':
                    await this.handleExtract(sendResponse);
                    break;
                case 'stopExtract':
                    await this.handleStopExtract(request, sendResponse);
                    break;
                default:
                    console.error("Unknown message type:", request.message);
                    sendResponse({message: "error", error: "Unknown message type"});
            }
        } catch (err) {
            console.log('Handle error ' + err);
        }
    }

    async handleDownload(request, sendResponse) {
        let downloadTask = this.getTaskById(request.taskId);
        let dataForDownload = await downloadTask.getDataForDownload();
        if (dataForDownload.length > 0) {
            let formattedData;
            switch (request.format) {
                case 'csv':
                    formattedData = saveToCSV(downloadTask.titles, dataForDownload, request.notIncludeColumns);
                    break;
                case 'json':
                    formattedData = saveToJSON(downloadTask.titles, dataForDownload, request.notIncludeColumns);
                    break;
            }
            sendResponse({message: 'ok', formattedData: formattedData, extractorName: downloadTask.extractorName});
            console.log("download ok 96");
        } else {
            sendResponse({message: 'empty'});
            console.error("download empty 99");
        }
    }

    async handleExtract(sendResponse) {
        const task = new ExtractTask(this.extractor.extractorName, [this.extractor.extractorStartUrl]);
        this.addTask(task);
        console.log('handleExtract: id = ' + task.id + 'name = ' + this.extractor.extractorName);
        sendResponse({ message: "ok", taskId: task.id });
    }

    async handleStopExtract(request, sendResponse) {
        let stopTask = this.getTaskById(request.taskId);
        stopTask.isStoppedExtract = true;
        console.log('handleStopExtract: id = ' + stopTask.id + 'name = ' + stopTask.extractorName);
        sendResponse({ message: "stopOk"});
    }

}


class ExtractTask {
    constructor(extractorName, urls, taskManager) {
        this.extractorName = extractorName;
        this.urls = urls;
        this.taskManager = taskManager;
        this.id = Date.now();
        this.dataForDownload = [];
        this.isStoppedExtract = false;
        this.titles = ["Стартовая страница"];
    }

    async start() {
        await this.extractData();
        this.isStoppedExtract = false;
    }

    async stop() {
        this.isStoppedExtract = true;
    }

    async getDataForDownload() {
        return this.dataForDownload;
    }

    getTaskId() {
        return this.id;
    }

    // проход по ссылкам
    // определение класса страницы и получение схожей страницы
    // получаем коллекторы по странице
    // собираем данные со страницы используя коллекторы
    // инициализация кучи, объекты в куче имеют вид {...: ..., priority: priority}
    async extractData() {
        try {
            let priorityQueue = new Heap();
            priorityQueue.lessThan = (a, b) => a.priority < b.priority;
            let priority = 0;
            let urlsPrior = [];
            this.urls.forEach((url) => {
                urlsPrior.push({priority: priority, data: url, type: 'link'});
            });
            priorityQueue.addElems(urlsPrior);

            let extractor = await ExtractorDB.getExtractor(this.extractorName);
            let [pageSamples, collectors] = await getDataByExtractor(extractor);

            let tab = new Tab();
            await tab.createTab(this.urls[0], 3000);

            let currentData = [];
            let lastPrior = 0;
            let scrapedElementCount = 0;
            while (!priorityQueue.isEmpty() && !this.isStoppedExtract) {
                let current = priorityQueue.pop();
                scrapedElementCount++;

                if (current.type === 'link' || current.type === 'pagination_link') {
                    await this.handleLinkOrPaginationLink(current, tab, pageSamples, collectors, priorityQueue);
                }

                if (lastPrior !== 0 && current.priority === 2) {
                    this.dataForDownload.push([...currentData]);
                    currentData.length = 0;
                }

                currentData.push(current.data);
                lastPrior = current.priority;
                console.log('Scraped element count: ' + scrapedElementCount);
            }
        } catch (err) {
            console.error("Error: {extractData}", err);
        }
    }

    async  handleLinkOrPaginationLink(current, tab, pageSamples, collectors, priorityQueue) {
        await tab.goToUrl(current.data);
        let response = await tab.sendMessageToTab({
            message: "extractData",
            pageSamples: pageSamples,
            collectors: collectors
        });

        if (response.message === "ok") {
            this.processResponseOk(response, current, priorityQueue);
        } else if (response.message === "update") {
            await this.updateCollectorAndPageSample(response, collectors, pageSamples);
        } else if (response.message === "singleElemCollectorUpdate") {
            await this.updateSingleElemCollector(response, current, priorityQueue, collectors);
        } else if (response.message === "continue") {
            // Continue with the next item
        } else {
            console.log(response.message);
        }
    }

    processResponseOk(response, current, priorityQueue) {
        let priority = current.priority+1;
        let priorityElems = [];
        let basePriority = priority;

        response.useData.forEach(item => {
            let currentPriority = item.type === 'pagination_link' ? basePriority : priority+1;
            priority++;
            item.data.forEach(elem => {
                priorityElems.push({priority: currentPriority, data: elem, type: item.type});
            });
            if (!this.titles.includes(item.name)) {
                this.titles.push(item.name);
            }
        });

        priorityQueue.addElems(priorityElems);
    }

    async  updateCollectorAndPageSample(response, collectors, pageSamples) {
        await CollectorDB.saveCollector(Object.assign(response.collector, {'extractorName': this.extractorName}));
        await PageSampleDB.savePageSample(Object.assign(response.pageSample, {'extractorName': this.extractorName}));

        collectors.push(Object.assign(response.collector, {'extractorName': this.extractorName}));
        pageSamples.push(Object.assign(response.pageSample, {'extractorName': this.extractorName}));
    }

    async  updateSingleElemCollector(response, current, priorityQueue, collectors) {
        let priority = current.priority;
        let priorityElems = [];
        let basePriority = ++priority;

        response.useData.forEach(item => {
            let currentPriority = item.type === 'pagination_link' ? basePriority : ++priority;
            item.data.forEach(elem => {
                priorityElems.push({priority: currentPriority, data: elem, type: item.type});
            });
            if (!this.titles.includes(item.name)) {
                this.titles.push(item.name);
            }
        });

        priorityQueue.addElems(priorityElems);

        response.collectors.forEach(collector => {
            CollectorDB.putCollector(Object.assign(collector, {'extractorName': this.extractorName}));
            collectors.forEach((col, index) => {
                if (col.collectorName === collector.collectorName && col.pageSampleName === collector.pageSampleName) {
                    collectors[index] = collector;
                }
            });
        });
    }

}

const taskManager = new TaskManager();

chrome.runtime.onInstalled.addListener(() => {
    new IndexedDBStorage().connectDB(console.log);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    taskManager.handleRequest(request, sendResponse).catch(error => {
        console.error("Error handling message:", error);
        sendResponse({message: "error", error: error.toString()});
    });
    return true;
});


async function getDataByExtractor(extractor) {
    let extractorName = extractor.extractorName;
    try {
        let requestsDB = [
            await PageSampleDB.getPageSamplesByExtractor(extractorName),
            await CollectorDB.getCollectorsByExtractor(extractorName)
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





