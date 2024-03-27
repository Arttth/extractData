function saveToCSV(collectors) {
    let str = "";
    for (let i = 0; i < datasets.length; ++i) {
        str += datasets[i].getDatasetName() + ";";
        str += collectors[i].getName();
    }
    str += "\n";
    for (let i = 0; i < collectors[0].getDataset().predictedData.length; ++i) {
        for (let j = 0; j < datasets.length; ++j) {
            str += datasets[j].predictedData[i] + ";";
        }
        str += "\n";
    }
    let data = new Blob([str], {type: 'text/csv;charset=UTF-8'});
    let link = document.createElement("a");
    link.href = URL.createObjectURL(data);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
}

function saveToEXCEL(collectors) {

}

function saveToJSON(collectors) {

}

