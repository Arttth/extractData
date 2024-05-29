const extractStartButton = document.getElementById("select-data-start");
const extractStopButton = document.getElementById("select-data-stop");
const dataFormat = document.getElementById("dataFormat");
const tasksSelect = document.getElementById('tasksSelect');

// let settingSkipUnmarked = false;

chrome.runtime.sendMessage({message: 'getTasks'}, (response) => {
   response.tasksDTO.forEach((task) => {
       tasksSelect.append(new Option(task.extractorName + ' ' +  task.taskId,
           task.taskId));
   })
});

extractStartButton.addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        console.log("send");
        chrome.tabs.sendMessage(tabs[0].id, {message: "start"})
        window.close();
    });
});

extractStopButton.addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {message: "stop"})
        let format = dataFormat.options[dataFormat.selectedIndex].value;
        chrome.runtime.sendMessage({message: "download", format: format, notIncludeColumns: [0], taskId: tasksSelect.value}, (response) => {
            if (response.message === 'ok') {
                let str = response.formattedData;
                let data = new Blob([str], {type: `text/${format};charset=UTF-8`});
                let link = document.createElement("a");
                link.href = URL.createObjectURL(data);
                document.body.appendChild(link);
                link.download = response.extractorName;
                link.click();
                URL.revokeObjectURL(link.href);
                setTimeout(() => {
                    URL.revokeObjectURL(link.href);
                    link.remove();
                }, 0);
            } else if (response.message === 'empty') {

            }
        });
    });
});


