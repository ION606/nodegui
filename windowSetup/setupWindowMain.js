const { QLabel, AlignmentFlag, QPushButton, QBoxLayout } = require("@nodegui/nodegui");
const alert = require('../utils/alert.js');
const logout = require('../database/logout.js');


/**
 * @param {String} sessionId 
 * @param {QBoxLayout} rootLayout
 */
async function setupWindowMain(client, username, sessionId, rootLayout) {
    if (!username) {
        return alert("An error occured, please try again later!", "ERROR");
    }

    const label = new QLabel();
    label.setObjectName('welomelabel');
    label.setText(`Hi there ${username}!`);

    const logoutBtn = new QPushButton();
    logoutBtn.setText("logout");
    logoutBtn.addEventListener('released', async () => {
        logout(client, username, sessionId);
    });


    rootLayout.addWidget(logoutBtn, AlignmentFlag.AlignCenter);
    rootLayout.addWidget(label, 1, AlignmentFlag.AlignCenter);
}


module.exports = setupWindowMain;