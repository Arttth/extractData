function saveToCSV(useData) {
    console.log(useData);
    let str = "";
    for (let i = 0; i < useData.length; ++i) {
        str += useData[i].name + ";";
    }
    str += "\n";
    for (let i = 0; i < useData[0].data.length; ++i) {
        for (let j = 0; j < useData.length; ++j) {
            str += useData[j].data[i] + ";";
        }
        str += "\n";
    }

    return str;
    // let data = new Blob([str], {type: 'text/csv;charset=UTF-8'});
    // let link = document.createElement("a");
    // link.href = URL.createObjectURL(data);
    // link.click();
    // URL.revokeObjectURL(link.href);
    // link.remove();
}


function saveToEXCEL(collectors) {

}

function saveToJSON(collectors) {

}

