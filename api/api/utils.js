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
