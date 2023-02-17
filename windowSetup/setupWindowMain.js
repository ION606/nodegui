const { QLabel, AlignmentFlag, QPushButton, QBoxLayout } = require("@nodegui/nodegui");
const fs = require('fs');
const getUsername = require('../utils/getUsername.js');
const alert = require('../utils/alert.js');


/**
 * @param {String} sessionId 
 * @param {QBoxLayout} rootLayout
 */
async function setupWindowMain(username, rootLayout) {
    if (!username) {
        return alert("An error occured, please try again later!", "ERROR");
    }

    const label = new QLabel();
    label.setObjectName('welomelabel');
    label.setText(`Hi there ${username}!`);

    // rootLayout.addWidget(header);
    rootLayout.addWidget(label, 1, AlignmentFlag.AlignCenter);
    // rootLayout.insertWidget(0, header);
    // global.win.setCentralWidget();
}


module.exports = setupWindowMain;