const {QTextBrowser, QScrollArea, QComboBox, QGridLayout, QLabel, QPushButton, QLineEdit, QBoxLayout} = require('@nodegui/nodegui');
const Imap = require('imap');
const {simpleParser} = require('mailparser');
const path = require('path');

const composeAndSend = require('./compose.js');
const emailMap = new Map();

// function saveFiles()


function getPage(ind, layout) {
    const keys = Array.from(emailMap.keys());
    const area = new QScrollArea();
    area.setWidgetResizable(true);

    for (let i = ind * 20; i < (ind+1) * 20; i++) {
        const btn = new QPushButton();
        btn.setText(keys[i]);
        btn.addEventListener('released', () => {
            const email = emailMap.get(keys[i]);

            if (email.attachments.length > 0) {
                return console.log(12, email.attachments);
            }

            const browser = new QTextBrowser();
            browser.setOpenExternalLinks(true);
            browser.setMinimumWidth(700);
            browser.setMinimumHeight(800);
            browser.setHtml(email.html);
            browser.setWindowFilePath(path.resolve(__dirname, '../files/email_files'));
            browser.setWindowTitle(keys[i]);
            browser.setInlineStyle('background-color: white; color:black');
            browser.setOpenExternalLinks(true);
            browser.setOpenLinks(true);
            browser.show();
        });

        layout.addWidget(btn, i);
    }

    area.setLayout(layout);
    area.show();
}


/**
 *@param {QGridLayout} layout
 */
async function createConnection(ic, layout) {
    console.log(ic.email, ic.password);
    const imapConfig = {
        user: ic.email,
        password: ic.password,
        host: 'mail.rpi.edu',
        port: 993,
        tls: true,
    };

    try {
        const imap = new Imap(imapConfig);
        imap.once('ready', () => {
            imap.openBox('INBOX', false, () => {
                const d = new Date();
                const monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                const monethName = monthList[d.getMonth()];
                imap.search(['UNSEEN', ['UNDELETED', 'UNDRAFT', ['SINCE', `${monethName} ${(d.getDay() > 7) ? 1 : d.getDay() - 7}, ${d.getFullYear()}`]]], (err, results) => {
                    const f = imap.fetch(results, {bodies: ''});
                    f.on('message', msg => {
                        msg.on('body', stream => {
                            simpleParser(stream, async (err, parsed) => {
                                // const {from, subject, textAsHtml, text} = parsed;
                                // console.log(parsed);
                                emailMap.set(parsed.subject, parsed);
                                /* Make API call to save the data
                                Save the retrieved data into a database.
                                E.t.c
                                */
                            });
                        });
                    // msg.once('attributes', attrs => {
                    //   const {uid} = attrs;
                    //   imap.addFlags(uid, ['\\Seen'], () => {
                    //     // Mark the email as read after reading it
                    //     console.log('Marked as read!');
                    //   });
                    // });
                    });

                    f.once('error', ex => {
                        return Promise.reject(ex);
                    });

                    f.once('end', () => {
                        console.log('Done fetching all messages!');
                        imap.end();
                    });
                });
            });
        });

        imap.once('error', err => {
            console.log(err);
        });

        imap.once('end', () => {
            console.log('Connection ended');
            const resPerPage = 20;
            
            const searchbar = new QLineEdit();
            searchbar.setPlaceholderText('query');
            layout.addWidget(searchbar);

            const newEmailBtn = new QPushButton();
            newEmailBtn.setText("Compose New Email");
            newEmailBtn.addEventListener('clicked', () => {
                composeAndSend(imap, ic.email, ic.password);
            });

            const pages = new QComboBox();

            for (let i = 0; i < Math.floor(emailMap.size % resPerPage) - 1; i++) {
                const pageBtn = new QPushButton();
                pageBtn.setText(`Page ${i+1}`);
                pageBtn.addEventListener('released', () => {
                    const l2 = new QGridLayout();
                    getPage(i, l2);
                });
                // layout.addWidget(pageBtn, 1 + i % 15, Math.floor(i/15));
                pages.addItem(undefined, `Page ${i+1}`);
            }

            pages.addEventListener('activated', (ind) => {
                const l2 = new QGridLayout();
                getPage(ind, l2);
            });

            layout.addWidget(pages, 1);
            layout.addWidget(newEmailBtn, 2);
        });

        imap.connect();
    } catch (ex) {
        console.log('an error occurred');
    }
}


module.exports = { createConnection }