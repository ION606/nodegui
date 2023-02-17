const getUsername = require('../utils/getUsername.js');
const setupWindowDb = require('../windowSetup/setupWindowDb');
const setupWindowMain = require('../windowSetup/setupWindowMain.js');


async function setupAllWindows(client, rootlayout, dblayout, noteslayout = null, botlayout = null) {
    const username = await getUsername(client, require('../config.json').sessionId);
    if (!username) {
        return alert("An error occured, please try again later!", "ERROR");
    }

    //Add the header to all pages
    setupWindowMain(username, rootlayout);
    setupWindowDb(client, username, dblayout);
}


module.exports = setupAllWindows;