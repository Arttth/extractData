function removeCollector(collector) {
        chrome.runtime.sendMessage({msg: "removeCollector", collector: collector}, (response) => {
            console.log(response);
        });
}

function saveDomain(domain) {
    chrome.runtime.sendMessage({msg: "saveDomain", 'domain': domain}, (response) => {
        console.log(response);
    });
}

function saveExtractor(extractor) {
    chrome.runtime.sendMessage({msg: "saveExtractor", 'extractor': extractor}, (response) => {
        console.log(response);
    });
}

// TODO: rename to saveArrayOfCollectors
function saveCollectors(collectors) {
    chrome.runtime.sendMessage({msg: "saveCollectors", 'collectors': collectors}, (response) => {
        console.log(response);
    });
}

function saveCollector(collector) {
    chrome.runtime.sendMessage({msg: "saveCollector", 'collector': collector}, (response) => {
        console.log(response);
    });
}

function getCollectors() {
    chrome.runtime.sendMessage({msg: "getCollectors"}, (response) => {
        return response.collectors;
    });
}

function savePageClassificator() {

}

function getCollectorsByScraper(scraperName) {
    let collectors = [];
    chrome.runtime.sendMessage({msg: "getCollectorsByScraper", scraperName}, (response) => {
        collectors = response.collectors;
    });
    return collectors;
}

function getPageClassificatorByScraper(scraperName) {
    let classificator = {};
    chrome.runtime.sendMessage({msg: "getClassificatorByScraper", scraperName}, (response) => {
        classificator = response.pageClassificator;
    });
    return classificator;
}


function getData() {
};

function updateData() {
};
