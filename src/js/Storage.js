function removeCollector(collector) {
        chrome.runtime.sendMessage({message: "removeCollector", collector: collector}, (response) => {
            console.log(response);
        });
}

function saveDomain(domain) {
    chrome.runtime.sendMessage({message: "saveDomain", 'domain': domain}, (response) => {
        console.log(response);
    });
}

function saveExtractor(extractor) {
    chrome.runtime.sendMessage({message: "saveExtractor", 'extractor': extractor}, (response) => {
        console.log(response);
    });
}

// TODO: rename to saveArrayOfCollectors
function saveCollectors(collectors) {
    chrome.runtime.sendMessage({message: "saveCollectors", 'collectors': collectors}, (response) => {
        console.log(response);
    });
}

function saveCollector(collector) {
    chrome.runtime.sendMessage({message: "saveCollector", 'collector': collector}, (response) => {
        console.log(response);
    });
}

function getCollectors() {
    chrome.runtime.sendMessage({message: "getCollectors"}, (response) => {
        return response.collectors;
    });
}

function savePageClassificator() {

}

function savePageSample(pageSample) {
    chrome.runtime.sendMessage({message: "savePageSample", 'pageSample': pageSample}, (response) => {
        console.log(response);
    });
}

function getCollectorsByScraper(scraperName) {
    let collectors = [];
    chrome.runtime.sendMessage({message: "getCollectorsByScraper", scraperName}, (response) => {
        collectors = response.collectors;
    });
    return collectors;
}

function getPageClassificatorByScraper(scraperName) {
    let classificator = {};
    chrome.runtime.sendMessage({message: "getClassificatorByScraper", scraperName}, (response) => {
        classificator = response.pageClassificator;
    });
    return classificator;
}

function getExtractors() {
    return
}


function getData() {
};

function updateData() {
};
