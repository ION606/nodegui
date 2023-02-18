const { QMainWindow , QBoxLayout, QWidget, Direction, QPushButton, QGridLayout } = require("@nodegui/nodegui");
const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');
const wait = require('node:timers/promises').setTimeout;
const { login } = require("./auth/login.js");
const setup = require('./windowSetup/setupAllWindows.js');
const setupHeader = require('./windowSetup/setupHeader.js');
const getUsername = require('./utils/getUsername.js');
const { sessionId, mongooseURI } = require('./config.json');

const client = new MongoClient(mongooseURI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const mongoconnection = client.connect();
// console.log(require('./auth/crypto.js').encrypt('password'));

const styles = fs.readFileSync('CSS/main.css');

async function main() {
    const win = new QMainWindow();
    win.setMinimumWidth(300);
    win.setMinimumHeight(300);
    win.setWindowTitle("home");

    // const centralWidget = new QWidget();
    // centralWidget.setObjectName("myroot");
    // centralWidget.setStyleSheet(styles);
    const rootLayout = new QBoxLayout(Direction.TopToBottom);
    const dbLayout = new QBoxLayout(Direction.TopToBottom);
    const notesLayout = new QGridLayout();
    // notesLayout.setSpacing(2);
    const botLayout = new QBoxLayout(Direction.TopToBottom);
    // centralWidget.setLayout(rootLayout);

    if (sessionId) {
        const client = await mongoconnection;

        global.win = win;
        const headerSetupDone = await setupHeader(client, getUsername, styles, rootLayout, dbLayout, notesLayout, botLayout);
        if (!headerSetupDone) return process.exit();

        setup(client, rootLayout, dbLayout, notesLayout, botLayout);
    } else {
        const loginBtn = new QPushButton();
        loginBtn.setText("Login");
        loginBtn.addEventListener('released', login);
        rootLayout.addWidget(loginBtn);
        
        const centralWidget = new QWidget();
        centralWidget.setLayout(rootLayout);
        win.setCentralWidget(centralWidget);
    }

    // rootLayout.setContentsMargins(0, 0, 0, 0);

    // win.setCentralWidget(centralWidget);
    win.setStyleSheet(styles);
    win.show();
}

main();