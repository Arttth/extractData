function saveToCSV(titles=[], data, notIncludeColumns) {
    console.log(data);
    console.log(titles);
    if (data.length === 0) {
        return '';
    }

    let escapeCSV = (value) => {
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    };

    let str = "";

    // Добавляем заголовки, если они есть
    if (titles.length > 0) {
        for (let i = 0; i < titles.length; ++i) {
            if (notIncludeColumns.indexOf(i) < 0) {
                str += escapeCSV(titles[i]) + ',';
            }
        }
        str += '\n';
    }


    if (data.length > 0) {
        for (let i = 0; i < data.length; ++i) {
            for (let j = 0; j < data[0].length; ++j) {
                if (notIncludeColumns.indexOf(i) < 0) {
                    str += escapeCSV(data[i][j]) + ',';
                }
            }
            str += '\n';
        }
    }

    return str;
}


function saveToJSON(titles = [], data, notIncludeColumns = []) {
    if (data.length === 0) {
        return '';
    }

    let objects = [];

    if (titles.length < data[0].length) {
        for (let i = titles.length; i < data[0].length; ++i) {
            if (notIncludeColumns.indexOf(i) < 0) {
                titles.push('feature' + i);
            }
        }
    }

    for (let i = 0; i < data.length; ++i) {
        let currentObject = {};
        for (let j = 0; j < data[i].length; ++j) {
            if (notIncludeColumns.indexOf(j) < 0) {
                currentObject[titles[j]] = data[i][j];
            }
        }
        objects.push(currentObject);
    }

    return JSON.stringify(objects, null, 2);
}
