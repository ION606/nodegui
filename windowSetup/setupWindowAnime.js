const { QTextBrowser } = require('@nodegui/nodegui');
const getAnime = require('../anime/getAnime.js');


//Maybe add lists and such later
async function setupWindowAnime(client, username, layout) {
    // getAnime('jojo', null, '100');
    
    const browser = new QTextBrowser();
    const resp = await fetch('https://ww4.gogoanimes.org/');
    const html = await resp.text()
    // console.log(`nigga ${html}`);
}

module.exports = setupWindowAnime;