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

exports.stringsSimilarityPercentage = (s1, s2) => {
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

exports.watchVariable = (variable, onChange, ...args) => {
    return new Proxy(JSON.parse ('{"watch":' + j + '}'), {
        set: (target, property, value) => {
            onChange(args);
        }
    });
}

exports.replaceAll = (string, find, replace) => {
    let regex;
    for (let i = 0; i < find.length; i++) {
        regex = new RegExp(find[i], "g");
        string = string.replace(regex, replace[i]);
    }
    return string;
};

exports.addToJSONFile = (file, toAdd) => {
    const fs = require('fs');
    fs.readFile(file, 'utf8', (err,data) => {
        if (err) {
            return console.log(err);
        }
        const result = JSON.stringify({ ...JSON.parse(data), ...toAdd });

        fs.writeFile(file, result, 'utf8', (err) => {
            if (err){
                return console.log(err);
            }
        });
    });
}
