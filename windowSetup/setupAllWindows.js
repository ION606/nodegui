const getUsername = require('../utils/getUsername.js');
const setupWindowDb = require('../windowSetup/setupWindowDb.js');
const setupWindowNotes = require('../windowSetup/setupWindowNotes.js');
const setupWindowMain = require('../windowSetup/setupWindowMain.js');
const setupWindowMail = require('../mail/setupWindowMail.js');
const setupWindowAnime = require('../windowSetup/setupWindowAnime');
const alert = require('../utils/alert.js');


async function setupAllWindows(client, rootlayout, dblayout, noteslayout, mailayout, animeLayout) {
    const { sessionId } = require('../config.json');
    const username = await getUsername(client, sessionId);
    if (!username) {
        return alert("An error occured, please try again later!", "ERROR");
    }

    //Add the header to all pages
    setupWindowMain(client, username, sessionId, rootlayout);
    setupWindowDb(client, username, dblayout);
    setupWindowNotes(client, username, sessionId, noteslayout);
    setupWindowMail(client, username, sessionId, mailayout);
    setupWindowAnime(client, username, sessionId, animeLayout)
}


module.exports = setupAllWindows;