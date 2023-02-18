const { QComboBox , QLabel, QWidget, QTabWidget, QIcon } = require("@nodegui/nodegui");
const blankIcon = new QIcon();
const alert = require('../utils/alert');


async function makeHeader(client, username, styles, rootlayout, dblayout, noteslayout, botlayout) {
    return new Promise(async (resolve) => {
        try {
            const cgo = client.db('database_custom_1').collection('userConfigs');
            const uconfigs = await cgo.findOne({username: username});
            if (!uconfigs) {
                await alert(`Database error:\nConfig files for user "${username} not found!`, "DATABASE ERROR");
                return resolve(false);
            }

            const headers = new QComboBox();
            headers.addItem(undefined, "home");
            headers.addItem(undefined, "Database");

            if (uconfigs.notesEnabled) headers.addItem(undefined, "Notes");
            if (uconfigs.hasBot) headers.addItem(undefined, "Selmer Bot");


            //#region setting up the layouts

            const tab = new QTabWidget();

            var widgeTemp = new QWidget();
            widgeTemp.setObjectName('myroot');
            widgeTemp.setLayout(rootlayout);
            widgeTemp.setStyleSheet(styles);
            tab.addTab(widgeTemp, blankIcon, "home");

            widgeTemp = new QWidget();
            widgeTemp.setObjectName('myroot');
            widgeTemp.setLayout(dblayout);
            widgeTemp.setStyleSheet(styles);
            tab.addTab(widgeTemp, blankIcon, "database");

            widgeTemp = new QWidget();
            widgeTemp.setObjectName('myroot');
            widgeTemp.setLayout(noteslayout);
            widgeTemp.setStyleSheet(styles);
            tab.addTab(widgeTemp, blankIcon, "notes");

            widgeTemp = new QWidget();
            widgeTemp.setObjectName('myroot');
            widgeTemp.setLayout(botlayout);
            widgeTemp.setStyleSheet(styles);
            tab.addTab(widgeTemp, blankIcon, "selmer bot");

            //#endregion

            global.win.setCentralWidget(tab);
            resolve(true);
        } catch (err) {
            console.error(err);
            await alert(`Uh oh! There's been an error!\nErr Message:\n${err.message}`, "ERROR");
            resolve(false);
        }
    });
}


module.exports = makeHeader;