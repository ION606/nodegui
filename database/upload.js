const { QFileDialog, FileMode, QErrorMessage } = require("@nodegui/nodegui");
const { MongoClient, ServerApiVersion, GridFSBucket } = require('mongodb');
const fs = require('fs');
const getUsername = require("../utils/getUsername");
const mongouri = require('../config.json').mongooseURI;

const client = new MongoClient(mongouri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const mongoconnection = client.connect();

/**
 * @returns {Promise<Array<String>}
 */
function createFileDialogue() {
    return new Promise((resolve) => {
        const upload = new QFileDialog();
        upload.setFileMode(FileMode.AnyFile);
        // upload.setNameFilter('Images (*.png *.xpm *.jpg)');
        upload.addEventListener('rejected', () => { resolve([]); });
        upload.addEventListener('accepted', () => { resolve(upload.selectedFiles()); });
        upload.exec();
    });
}

async function getAndUploadFile() {
    const paths = await createFileDialogue();
    if (paths.length == 0) return;

    const client = await mongoconnection;
    const db = client.db('database_custom_1');

    const username = await getUsername(client, require('../config.json').sessionId);

    //Maybe have this be the folder name?
    const bucket = new GridFSBucket(db, {bucketName: username});


    const notUploaded = new Array();
    for (let path of paths) {
        const pathsplit = path.split('/');
        const filename = pathsplit[pathsplit.length - 1];
        const fileExtention = filename.substring(filename.lastIndexOf('.'));
        
        const doc = await bucket.find({filename}).next();
        if (doc) {
            notUploaded.push(filename);
            continue;
        }

        //Check to see if this file already exists
        // const doc = await bucket.find({});
       fs.createReadStream(path).pipe(bucket.openUploadStream(filename), {
            chunkSizechunkSizeBytes: 1048576,
            extension: fileExtention
            // user: userId
       });
    }

    console.log(notUploaded);
}


module.exports = { getAndUploadFile }