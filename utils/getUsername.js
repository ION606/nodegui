const fs = require('fs');
const path = require('path');
const alert = require('../utils/alert.js');

const remSessionId = () => {
    const p = path.resolve(__dirname, "../config.json");
    const data = fs.readFileSync(p, 'utf8');
        
    var obj = JSON.parse(data);
    delete obj["sessionId"];
    json = JSON.stringify(obj);
    fs.writeFile(p, json, (err) => {
        if (err) {
            console.error(err);
            alert("an error has occured, please restart your application!", "ERROR");
        }
    });
}


async function getUsername(client, sessionId) {
    return new Promise(async (resolve) => {
        const dbo = client.db('database_custom_1').collection('appsessions');
        const doc = await dbo.findOne({sessionId: sessionId});
        if (!doc) {
            remSessionId();
            return resolve(undefined);
        }

        resolve(doc.username);
    });
}


module.exports = getUsername;