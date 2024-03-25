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
    });
});