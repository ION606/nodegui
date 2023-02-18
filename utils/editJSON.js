const fs = require('fs');
const path = require('path');

function addToJSONFile(key, val) {
    return new Promise((resolve, reject) => {
        const p = path.resolve(__dirname, "../config.json");
        const data = fs.readFileSync(p, 'utf8');
        
        obj = JSON.parse(data); //now it an object
        obj[key] = val; //add some data
        json = JSON.stringify(obj); //convert it back to json
        fs.writeFile(p, json, (err) => {
            if (err) { return reject(err); }
            resolve();
        }); // write it back
    });
}


function wipeJSONFile() {
    return new Promise((resolve, reject) => {
        const p = path.resolve(__dirname, "../config.json");
        const data = fs.readFileSync(p, 'utf8');
        
        var keysToDelete = ["sessionId", "filepath"];

        obj = JSON.parse(data);

        for (let i = 0; i < keysToDelete; i++) {
            if (obj[keysToDelete[i]]) delete obj[keysToDelete[i]];
        }

        json = JSON.stringify(obj);
        fs.writeFile(p, json, (err) => {
            if (err) { return reject(err); }
            resolve(true);
        });
    });
}

module.exports = {addToJSONFile, wipeJSONFile};