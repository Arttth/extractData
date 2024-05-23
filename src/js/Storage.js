function removeCollector(collector) {
        chrome.runtime.sendMessage({message: "removeCollector", collector: collector}, (response) => {
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

function putCollector(collector) {
    chrome.runtime.sendMessage({message: "putCollector", 'collector': collector}, (response) => {

    });
}

function getCollectors() {
    chrome.runtime.sendMessage({message: "getCollectors"}, (response) => {
        return response.collectors;
    });
}

function getCollectorsByPageSample() {
    chrome.runtime.sendMessage({message: "getCollectorsByPageSample"}, (response) => {
        return response.collectors;
    });
}

function savePageSample(pageSample) {
    chrome.runtime.sendMessage({message: "savePageSample", 'pageSample': pageSample}, (response) => {
        console.log(response);
    });
}

function  getPageSamples(extractorName) {
    chrome.runtime.sendMessage({message: "getPageSamples"}, (response) => {
        console.log(response);
    });
}


function getExtractors() {

}


