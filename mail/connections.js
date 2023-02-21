const {QTextBrowser, QScrollArea, QComboBox, QGridLayout, QLabel, QPushButton, QLineEdit, QBoxLayout} = require('@nodegui/nodegui');
const Imap = require('imap');
const {simpleParser} = require('mailparser');
const {addToJSONFile} = require('../utils/editJSON.js');
const fs = require('fs');
const path = require('path');

const composeAndSend = require('./compose.js');
const { restart } = require('../utils/processManip.js');
var emailMap = [];

function saveReadConfig(val) {
    return new Promise((resolve, reject) => {
        const p = path.resolve(__dirname, "../config.json");
        const data = fs.readFileSync(p, 'utf8');
        
        obj = JSON.parse(data); //now it an object
        obj.mail.showSeen = val; //add some data
        json = JSON.stringify(obj); //convert it back to json
        fs.writeFile(p, json, (err) => {
            if (err) { return reject(err); }
            resolve();
        }); // write it back
    });
}

function createBrowserPage(email) {
    return new Promise((resolve) => {
        const browser = new QTextBrowser();
        browser.setOpenExternalLinks(true);
        browser.setMinimumWidth(700);
        browser.setMinimumHeight(800);
        browser.setHtml(email.html || email.textAsHtml);
        browser.setWindowFilePath(path.resolve(__dirname, '../files/email_files'));
        browser.setWindowTitle(email.subject);
        browser.setInlineStyle('background-color: white; color:black');
        browser.setOpenExternalLinks(true);
        browser.setOpenLinks(true);
        browser.show();
        resolve(browser);
    });
}

function getPage(ind, layout) {
    // const keys = Array.from(emailMap.keys());
    const area = new QScrollArea();
    area.setWidgetResizable(true);

    for (let i = ind * 20; i < (ind+1) * 20; i++) {
        if (i >= emailMap.length) break;
        
        const btn = new QPushButton();
        btn.setText(emailMap[i].subject);
           btn.addEventListener('released', async () => {
            const email = emailMap[i];

            if (email.attachments.length > 0) {
                return console.log(email.attachments);
            }

            // console.log(email);
            await createBrowserPage(email);
        });

        layout.addWidget(btn, i);
    }

    area.setLayout(layout);
    area.show();
}


function getPageQuery(queryArr) {
    const layout = new QGridLayout();
    const area = new QScrollArea();
    area.setWidgetResizable(true);

    for (let i = 0; i < queryArr.length; i++) {        
        const btn = new QPushButton();
        btn.setText(queryArr[i].subject);
           btn.addEventListener('released', async () => {
            const email = queryArr[i];

            if (email.attachments.length > 0) {
                return console.log(email.attachments);
            }

            // console.log(email);
            await createBrowserPage(email);
        });

        layout.addWidget(btn, i);
    }

    area.setLayout(layout);
    area.show();
}


/**
 *@param {QGridLayout} layout
 */
async function createConnection(ic, layout,) {
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
                const monthName = monthList[d.getMonth()];
                const filterDate = `${monthName} ${(d.getDate() < 7) ? 1 : d.getDate() - 7}, ${d.getFullYear()}`;

                // console.log(filterDate);
 
                var filterArr = ['UNDELETED', 'UNDRAFT', ['SINCE', filterDate]];
                if (!ic.showSeen) filterArr.push('UNSEEN');

                imap.search(filterArr, (err, results) => {
                    const f = imap.fetch(results, {bodies: ''});
                    f.on('message', msg => {
                        msg.on('body', stream => {
                            simpleParser(stream, async (err, parsed) => {
                                // const {from, subject, textAsHtml, text} = parsed;
                                // emailMap.set(parsed.subject, parsed);
                                emailMap.push(parsed);

                                // emailMap.set(parsed.date.toString(), parsed);
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

            // This is criminally inefficient
            // emailMap = new Map([...emailMap.entries()].sort((a, b) => {
            //     const date1 = (new Date(a[1].date)).getTime();
            //     const date2 = (new Date(b[1].date)).getTime();

            //     console.log(date1, date2);
            //     return date1 > date2;
            // }));
            
            emailMap.sort((a, b) => {
                const date1 = (new Date(a.date)).getTime()/1000;
                const date2 = (new Date(b.date)).getTime()/1000;

                return date2 - date1;
            });

            const searchbar = new QLineEdit();
            searchbar.setPlaceholderText('query');
            searchbar.addEventListener('returnPressed', async () => {
                const query = searchbar.text();
                const selectionArr = emailMap.filter((e) => e.subject.indexOf(query) != -1);
                getPageQuery(selectionArr);
            });

            layout.addWidget(searchbar);

            const newEmailBtn = new QPushButton();
            newEmailBtn.setText("Compose New Email");
            newEmailBtn.addEventListener('clicked', () => {
                composeAndSend(imap, ic.email, ic.password);
            });

            const toggleSeen = new QPushButton();
            toggleSeen.setText((ic.showSeen) ? "Hide Read Emails" : "Show Read Emails");
            toggleSeen.addEventListener('clicked', async () => {
                await saveReadConfig(!ic.showSeen);
                toggleSeen.setText((!ic.showSeen) ? "Hide Read Emails" : "Show Read Emails");
                ic.showSeen = !ic.showSeen;
                restart();
            });

            const pages = new QComboBox();

            var ll = Math.floor(emailMap.length / resPerPage);
            if (emailMap.length % 20 != 0) ll ++;

            for (let i = 0; i < ll; i++) {
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

            layout.addWidget(toggleSeen, 3);
            layout.addWidget(pages, 1);
            layout.addWidget(newEmailBtn, 2);
        });

        imap.connect();
    } catch (ex) {
        console.log('an error occurred');
    }
}


module.exports = { createConnection }