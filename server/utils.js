const fs = require('fs');

const editDistance = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    let costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

const _compareArrayElements = (firstArray, secondArray) => {
    return firstArray.length === secondArray.length && firstArray.every(element => secondArray.includes(element));
}

exports.stringsSimilarityPercentage = (s1, s2) => {
    if( _compareArrayElements(s1.split(/-| /), s2.split(/-| /))){
        return 1.0;
    }
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    let longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

exports.replaceAll = (string, find, replace) => {
    let regex;
    for (let i = 0; i < find.length; i++) {
        regex = new RegExp(find[i], "g");
        string = string.replace(regex, replace[i]);
    }
    return string;
};

exports.createJSONFile = (file, content) => {
    if(!fs.existsSync(file)){
        fs.writeFile(file, content, (err) => {
            if (err) throw err
        });
    }
}

exports.decimalTo32octetsBinary = (number) => {
    const binary = [];
    for(let i = 31; i > -1; i--){
        const bit = (number >= Math.pow(2, i)) ? 1 : 0;
        number = (bit === 1) ? number - Math.pow(2, i) : number;
        binary.push(bit);
    }
    return binary;
}

exports.binaryToDecimal = (binaryString) => {
    let result = 0;
    binaryString = binaryString.split("").reverse().join("");
    for(let i = 0; i < binaryString.length; i++){
        result += (binaryString[i] === "1") ? Math.pow(2, i) : 0;
    }
    return result;
}