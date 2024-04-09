class ChromeLocal extends Storage {
    saveCollector(domain, name, collector) {
        chrome.storage.local.set({[domain+"_"+name+"_collector"]: collector}, () => {

        });
    }

    updateCollector() {

    }
    deleteCollector() {

    }

    getCollector() {

    }
}