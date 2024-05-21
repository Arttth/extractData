function saveToCSV(useData) {
    console.log(useData);
    let str = "";
    // for (let i = 0; i < useData.length; ++i) {
    //     str += useData[i].name + ";";
    // }
    // str += "\n";
    for (let i = 0; i < useData.length; ++i) {
        for (let j = 0; j < useData[i].length; ++j) {
            str += useData[i][j] + ";"
        }
        str += "\n";
    }

    return str;

}


function saveToEXCEL(collectors) {

}

function saveToJSON(collectors) {

}

