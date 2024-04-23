const extractStartButton = document.getElementById("select-data-start");
const extractStopButton = document.getElementById("select-data-stop");

extractStartButton.addEventListener("click", (event) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        console.log("send");
        chrome.tabs.sendMessage(tabs[0].id, {message: "start"})
        // закрытие popup
        window.close();
    });
});

extractStopButton.addEventListener("click", (event) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        console.log("send");
        chrome.tabs.sendMessage(tabs[0].id, {message: "stop"})
        chrome.runtime.sendMessage({message: "download", format: 'csv'}, (response) => {
            let str = response.data;
            let data = new Blob([str], {type: 'text/csv;charset=UTF-8'});
            let link = document.createElement("a");
            link.href = URL.createObjectURL(data);
            link.click();
            URL.revokeObjectURL(link.href);
            link.remove();
        });
    });
});