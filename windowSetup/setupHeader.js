const { QComboBox , QLabel, QWidget, QTabWidget, QIcon } = require("@nodegui/nodegui");
const layouts = new Map();
const blankIcon = new QIcon();


function restart() {
    process.on("exit", function () {
        require("child_process").spawn(process.argv.shift(), process.argv, {
            cwd: process.cwd(),
            detached : true,
            stdio: "inherit"
        });
    });
    process.exit();
}


function reLayout(layoutStr, win) {
    const widge = layouts.get(layoutStr);
    win.setCentralWidget(widge);
}


async function makeHeader(client, username, styles, rootlayout, dblayout, noteslayout, botlayout, win) {
    return new Promise(async (resolve) => {
        const cgo = client.db('database_custom_1').collection('userConfigs');
        const uconfigs = await cgo.findOne({username: username});
        if (!uconfigs) {
            
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

        // headers.addEventListener('activated', async (ind) => {
        //     const page = headers.itemText(ind).toLowerCase();
        //     switch (page) {
        //         case 'database': reLayout(page, win);
        //         break;

        //         // case 'notes': reLayout(page);
        //         // break;

        //         // case 'selmer bot': reLayout(page);
        //         // break;

        //         default:
        //             reLayout('home', win);
        //     }
        // });
        
        resolve(true);
    });
}


module.exports = makeHeader;