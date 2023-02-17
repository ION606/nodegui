const { QDialog, QGridLayout, QLineEdit, WindowState, QPushButton, QIcon } = require('@nodegui/nodegui');
const { MongoClient, ServerApiVersion, GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require("path");
const { decrypt } = require('./crypto.js');
const alert = require('../utils/alert.js');
const mongouri = require('../config.json').mongooseURI;
const uuid5 = require('uuid').v4;

const client = new MongoClient(mongouri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const mongoconnection = client.connect();


async function createNewSession(client, username) {
    return new Promise(async (resolve, reject) => {
        const dbo = client.db('database_custom_1').collection('appsessions');
        const sessionId = uuid5();
        dbo.insertOne({sessionId: sessionId, username: username});
        const p = path.resolve(__dirname, "../config.json");
        const data = fs.readFileSync(p, 'utf8');

        const cgo = client.db('database_custom_1').collection('userConfigs');
        const cdoc = await cgo.findOne({username: username});
        if (!cdoc) {
            cgo.insertOne({notesEnabled: true, hasBot: false, username: username});
        }
        
        obj = JSON.parse(data); //now it an object
        obj.sessionId = sessionId; //add some data
        json = JSON.stringify(obj); //convert it back to json
        fs.writeFile(p, json, (err) => {
            if (err) { return reject(err); }
            resolve();
        }); // write it back 
    });
}


async function authorizeAndLogin(username, password, window) {
    const client = await mongoconnection;
    const dbo = client.db('database_custom_1').collection('authorized');
    const doc = await dbo.findOne({username: username});
    
    if (!doc) {
        return alert(`no account with the username "${username}" found!`, "ERROR");
    }
    
    const passDecrypted = await decrypt(doc);
    if (password != passDecrypted) {
        return alert("Incorrect Password!", "ERROR");
    }

    createNewSession(client, username).then(async () => {
        const clicked = await alert("you're logged in!", "SUCCESS");

        //Refresh the main window
        process.on("exit", function () {
            require("child_process").spawn(process.argv.shift(), process.argv, {
                cwd: process.cwd(),
                detached : true,
                stdio: "inherit"
            });
        });
        process.exit();
    }).catch((err) => {
        console.error(err);
        alert(err.message, "ERROR");
    })
    
}


async function createLoginDialogue() {
    const dialogue = new QDialog();
    dialogue.setModal(true);
    
    const username = new QLineEdit();
    username.setObjectName('username');
    username.setPlaceholderText("username");

    const password = new QLineEdit();
    password.setObjectName('password');
    password.setPlaceholderText("password");

    const ok = new QPushButton();
    ok.setText("OK");
    
    const cancel = new QPushButton();
    cancel.setText("CANCEL");
    
    const loginboxLayout = new QGridLayout();
    loginboxLayout.setEnabled(true);
    loginboxLayout.addWidget(username, 0, 0, 1, 2);
    loginboxLayout.addWidget(password, 1, 0, 1, 2);
    loginboxLayout.addWidget(ok, 2, 0);
    loginboxLayout.addWidget(cancel, 2, 1);


    dialogue.setLayout(loginboxLayout);

    cancel.addEventListener('clicked', (event) => {
        dialogue.close();
    });

    ok.addEventListener('clicked', async () => {
        const uname = username.text();
        const upass = password.text();
        let triggerClose = false;

        if (!uname) {
            username.setStyleSheet("border-width: 1px; border-color: red; border-style: solid;");
            triggerClose = true;
        } else { username.setStyleSheet("border-style: none"); }

        if (!upass) {
            password.setStyleSheet("border-width: 1px; border-color: red; border-style: solid;");
            triggerClose = true;
        } else { password.setStyleSheet("border-style: none"); }

        if (triggerClose) { return; }
        
        const isAuth = await authorizeAndLogin(uname, upass, dialogue);
    });


    dialogue.setWindowTitle("login");
    dialogue.show();

    // const loginbox = new QWidget();
    // loginbox.setStyleSheet("color: white;");
    // loginbox.setLayout(loginboxLayout);

    // password.addEventListener('rejected', loginbox.close);
    // loginbox.show();
}

async function login() {
    createLoginDialogue();
}

module.exports = { login }