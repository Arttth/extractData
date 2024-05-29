class Tab {
    constructor(url='') {
        this.url = url;
        this.browserTab = null;
    }

    // возвращает таб из tabApi
    async createTabFullLoad(url) {
        if (!url) {
            throw new Error('URL is undefined or invalid');
        }
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

        this.browserTab = await chrome.tabs.create({ url });
        await waitForTabLoadingToComplete(this.browserTab.id);
        return this;
    }

    async createTab(url, loadTime) {
        this.browserTab = await chrome.tabs.create({ url });
        await new Promise(resolve => setTimeout(() => {
            resolve();
        }, loadTime));
        return this;
    }

    async goToUrl(url) {
        this.url = url;
        chrome.tabs.update(this.browserTab.id, {url});
        return new Promise((resolve) => {
            const onUpdated = (tabId, info) => {
                if (tabId === this.browserTab.id && info.status === 'complete') {
                    chrome.tabs.onUpdated.removeListener(onUpdated);
                    resolve();
                }
            };

            chrome.tabs.onUpdated.addListener(onUpdated);
        });
    }

    async sendMessageToTab(data) {
        return chrome.tabs.sendMessage(this.browserTab.id, data);
    }

}