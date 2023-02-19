const { QDialog, Direction, QAction, QBoxLayout, QPushButton, QLineEdit, QTextEdit, QLabel, QKeySequence, QGridLayout, QComboBox, InputDialogOptions } = require("@nodegui/nodegui");
const { createConnection } = require('./connections.js');
const path = require('path');
const fs = require('fs');
const alert = require("../utils/alert");
const { restart } = require('../utils/processManip.js');
const { addToJSONFile } = require('../utils/editJSON.js');

async function getCredentials() {
    const p = path.resolve(__dirname, "../config.json");
    const data = fs.readFileSync(p, 'utf8');
    var obj = JSON.parse(data);
    return obj.mail;
    // return {"mail": obj.mail.email, "password": obj.mail.password};
}


async function createEmailLoginForm() {
    return new Promise((resolve) => {
        const dialogue = new QDialog();
        dialogue.setModal(true);
        dialogue.setWindowTitle('Email Login');
        
        const label = new QLabel();
        label.setText('disclaimer: your email data is only stored locally');
        label.setDisabled(true);

        const inpemail = new QLineEdit();
        inpemail.setPlaceholderText('username@rpi.edu');

        const inpassword = new QLineEdit();
        inpassword.setPlaceholderText('secret123!');

        var passRaw = "";

        inpassword.addEventListener('textChanged', async () => {
            const txt = inpassword.text();
            if (txt.endsWith('•') && txt.length >= passRaw.length) return;
    
            if (txt.length > passRaw.length) {
                passRaw += txt[txt.length - 1];
            } else {
                passRaw = passRaw.substring(0, passRaw.length - 1);
            }
    
            const newtext = "•".repeat(txt.length);
            inpassword.setText(newtext);
        });

        const submitbtn = new QPushButton();
        submitbtn.setText('submit');
        submitbtn.addEventListener('released', async () => {
            const email = inpemail.text();
            let triggerClose = false;

            if (!inpemail || !email.endsWith('@rpi.edu')) {
                inpemail.setStyleSheet("border-width: 1px; border-color: red; border-style: solid;");
                triggerClose = true;
            } else { inpemail.setStyleSheet("border-style: none"); }
    
            if (!passRaw) {
                inpassword.setStyleSheet("border-width: 1px; border-color: red; border-style: solid;");
                triggerClose = true;
            } else { inpassword.setStyleSheet("border-style: none"); }
    
            if (triggerClose) { return; }

            await addToJSONFile("mail", {email: email, password: passRaw});
            resolve(true);
        });

        const layout = new QGridLayout();
        layout.addWidget(inpemail);
        layout.addWidget(inpassword, 1);
        layout.addWidget(submitbtn, 2);
        layout.addWidget(label, 3);

        dialogue.setLayout(layout);
        dialogue.show();
    });
}


/**
 * @param {QGridLayout} layout
 */
async function setupWindowMail(client, username, sessionId, layout) {
    /*
    const imapConfig = {
      user: 'youremail@gmail.com',
      password: 'secret',
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
    };*/


    const imapConfig = await getCredentials();

    if (!imapConfig) {
        const btn = new QPushButton();
        btn.setText('Enable email');
        btn.addEventListener('clicked', async () => {
            await createEmailLoginForm();
            restart();
        });
        return layout.addWidget(btn);
    }

    createConnection(imapConfig, layout);
}


module.exports = setupWindowMail;