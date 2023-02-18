const { wipeJSONFile } = require('../utils/editJSON.js');
const { restart } = require('../utils/processManip.js');
const alert = require('../utils/alert.js');

async function logout(client, username, sessionId) {
    const dbo = client.db("database_custom_1").collection("appsessions");

    const doc = await dbo.findOne({sessionId: sessionId});
    if (doc) {
        dbo.deleteOne({sessionId: sessionId});
    }

    await wipeJSONFile();
    await alert("logged out successfully!");
    process.exit();
}


module.exports = logout;