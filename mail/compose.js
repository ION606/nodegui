const { QDialog, QGridLayout, QLineEdit, QPushButton, QTextEdit, QLabel, QWidget } = require('@nodegui/nodegui');
const Imap = require('imap');
const nodemailer = require('nodemailer');
const alert = require('../utils/alert.js');


async function sendMail(username, password, recipents, subject, contentRaw, contentHTML, attachments, cc, bcc) {
    return new Promise(async (resolve) => {
        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            host: "mail.rpi.edu",
            port: 465,
            secure: true,
            auth: {
                user: username,
                pass: password,
            },
        });

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: `${username}@rpi.edu`,
            to: recipents, // "bar@example.com, baz@example.com",
            subject: subject, // "Hello ✔",
            attachments: attachments,
            cc: cc,
            bcc: bcc,
            text: contentRaw,
            html: contentHTML//"<b>Hello world?</b>", // html body
        });


        resolve("Message sent: %s", info.messageId);
    });
}


async function createEmailForm(username, password) {
    const form = new QDialog();
    const layout = new QGridLayout();
    const recipients = new QLineEdit();
    const cc = new QLineEdit();
    const bcc = new QLineEdit();
    const subject = new QLineEdit();
    const content = new QTextEdit();
    const sendBtn = new QPushButton();
    sendBtn.setText('Send');

    sendBtn.addEventListener('released', async () => {
        const rectext = recipients.text();
        const subjText = subject.text();
        const cctxt = (cc.text().length > 0) ? cc.text() : undefined;
        const bcctxt = (cc.text().length > 0) ? cc.text() : undefined;

        if (!rectext || !subjText) return alert("Please fill out the 'recipent' and 'subject' fields", "Warning");

        await sendMail(username, password, rectext, subjText, content.toPlainText(), content.toHtml(), undefined, cctxt, bcctxt);
        await alert("Email Sent!", "SUCCESS");
        form.close();
    });

    const labelList = ["recipients", "subject", "cc", "bcc"];
    const inpList = [recipients, subject, cc, bcc, content];

    for (let i = 0; i < labelList.length; i++) {
        const label = new QLabel();
        label.setText(labelList[i]);
        layout.addWidget(label, i);
        layout.addWidget(inpList[i], i, 1);
    }

    const contentLabel = new QLabel();
    contentLabel.setText('content');
    layout.addWidget(contentLabel, inpList.length + 1);
    layout.addWidget(content, inpList.length + 1, 1, 2);
    layout.addWidget(sendBtn, inpList.length + 3, 1, 2);

    form.setLayout(layout);
    form.show();
}


/**
 * @param {Imap} imap 
 */
async function composeAndSend(imap, username, password) {
    createEmailForm(username, password);
}


module.exports = composeAndSend;