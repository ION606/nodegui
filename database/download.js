const { MongoClient, ServerApiVersion, GridFSBucket } = require('mongodb');
const mongouri = require('../config.json').mongooseURI;


async function getFile(filename) {
    if (!filename) return console.log(filename);
    const client = await mongoconnection;
    const db = client.db('database_custom_1');
    const bucket = new GridFSBucket(db, {bucketName: 'customBucket'});

    const doc = await bucket.find({filename}).next();
    if (!doc) { return console.log("no file found...."); }

    bucket.openDownloadStreamByName(`${filename}`).
    pipe(fs.createWriteStream(`../files/${filename}`));
}


module.exports = { getFile }