const { GridFSBucket } = require('mongodb');
const { QComboBox, QBoxLayout, QLineEdit, QPushButton, QLabel, AlignmentFlag } = require('@nodegui/nodegui');
const fs = require('fs');
const path = require("path");
const { getAndUploadFile } = require('../database/upload.js');
const {addToJSONFile} = require('../utils/editJSON.js');
const alert = require('../utils/alert.js');


async function getFile(bucket, filename) {
    const doc = await bucket.find({filename}).next();
    if (!doc) { return console.log("no file found...."); }

    const pathstr = (require('../config.json').filepath || path.resolve(__dirname, `../files/${filename}`));

    const p = path.resolve(__dirname, pathstr);
    bucket.openDownloadStreamByName(`${filename}`).
    pipe(fs.createWriteStream(p));
}


/**
 * @param {*} client 
 * @param {*} username 
 * @param {QBoxLayout} layout 
 */
async function setUpDbWindow(client, username, layout) {
    const db = client.db('database_custom_1');
    const bucket = new GridFSBucket(db, {bucketName: username});
    const doc = await bucket.find().toArray();
    const headers = new QComboBox();
    headers.addItem(undefined, 'no file selected');

    for (let i = 0; i < doc.length; i++) {
        headers.addItem(undefined, doc[i].filename);
    }

    headers.addEventListener('activated', async (ind) => {
        const filename = headers.itemText(ind).toLowerCase();
        if (filename == 'no file selected') return;

        const downloadFileBool = await alert(`Download "${filename}"?`, "Warning!", null, true);
        if (!downloadFileBool) return;

        getFile(bucket, filename);
    });


    layout.addWidget(headers, AlignmentFlag.AlignCenter);

    const pathstr = require('../config.json').filepath || path.resolve(__dirname, `../files/`);
    const filepathwidge = new QLineEdit();
    filepathwidge.setPlaceholderText(pathstr);
    filepathwidge.setFixedHeight(30);
    filepathwidge.setStyleSheet("border-style: solid; border-color: white;");

    filepathwidge.addEventListener('returnPressed', () => {
        const newpath = filepathwidge.text();
        if (newpath === path.basename(newpath)) return alert("incorrect file path!", "ERROR");
        addToJSONFile("filepath", newpath).then(() => {
            filepathwidge.setPlaceholderText(newpath);
            filepathwidge.clear();
        }).catch((err) => {
            console.error(err);
        });
    })

    // Up way too high for some reason
    // const saveLabel = new QLabel();
    // saveLabel.setText("Save Path");
    // saveLabel.setStyleSheet('margin:0px;');
    // layout.addWidget(saveLabel, AlignmentFlag.AlignCenter);

    layout.addWidget(filepathwidge, AlignmentFlag.AlignCenter);
    const uploadBtn = new QPushButton();
    uploadBtn.setText("File Upload");
    uploadBtn.addEventListener('released', getAndUploadFile);
    layout.addWidget(uploadBtn, AlignmentFlag.AlignCenter);
}


module.exports = setUpDbWindow;