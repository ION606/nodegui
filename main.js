const { QMainWindow , QBoxLayout, QWidget, Direction, QPushButton, ToolButtonPopupMode } = require("@nodegui/nodegui");
const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');
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
    const notesLayout = new QBoxLayout(Direction.TopToBottom);
    const botLayout = new QBoxLayout(Direction.TopToBottom);
    // centralWidget.setLayout(rootLayout);

    if (sessionId) {
        const client = await mongoconnection;

        global.win = win;
        const header = await setupHeader(client, getUsername, styles, rootLayout, dbLayout, notesLayout, botLayout, win);

        // rootLayout.insertWidget(0, header);
        // dbLayout.insertWidget(0, header);
        // notesLayout.insertWidget(0, header);
        // botLayout.insertWidget(0, header);
        
        setup(client, rootLayout, dbLayout, notesLayout, botLayout);
    } else {
        const loginBtn = new QPushButton();
        loginBtn.setText("Login");
        loginBtn.addEventListener('released', login);
        rootLayout.addWidget(loginBtn);
    }

    // rootLayout.setContentsMargins(0, 0, 0, 0);

    // win.setCentralWidget(centralWidget);
    win.setStyleSheet(styles);
    win.show();
}

main();