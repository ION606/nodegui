const { QDialog, Direction, QWidget, QIcon, QBoxLayout, QPushButton, QLineEdit, QTextEdit, QLabel, AlignmentFlag, QGridLayout, QComboBox } = require("@nodegui/nodegui");
const alert = require("../utils/alert");

const notesMap = new Map();

/**
 * @description returns [notename, notecontent]
 * @returns {Promise<Array<String>>}
 */
async function createNewNoteDialogue(client, username) {
    return new Promise((resolve, reject) => {
        const dialogue = new QDialog();
        dialogue.setModal(true);
        
        const notetitleLine = new QLineEdit();
        notetitleLine.setPlaceholderText("note title");

        const notecontent = new QTextEdit();
        notecontent.setPlaceholderText("note content here");

        const submitbtn = new QPushButton();
        submitbtn.setText("Submit");
        submitbtn.addEventListener('released', async () => {
            if (!notetitleLine.text()) { return; }
            resolve([notetitleLine.text(), notecontent.toPlainText()]);
            await alert("Note added!", "SUCCESS");
            dialogue.close();
        });

        const layout = new QBoxLayout(Direction.TopToBottom);
        layout.addWidget(notetitleLine);
        layout.addWidget(notecontent);
        layout.addWidget(submitbtn);

        dialogue.setLayout(layout);
        dialogue.show();
        // resolve(["hello", "world"]);
    });
}


async function search(client, username, txt, bar, layout) {
    const dbo = client.db('database_custom_1').collection(`${username}.notes`);
    const doc = await dbo.findOne({titleLower: txt.toLowerCase()});
    if (!doc) { return bar.setStyleSheet("border-width: 1px; border-color: red; border-style: solid;"); }

    const noteTitle = new QLabel();
    const noteContent = new QLabel();
    const noteTimeStamp = new QLabel();

    noteTitle.setText(doc.title);
    noteContent.setText(doc.content);
    noteTimeStamp.setText(`Last edited at ${new Date(doc.lastEditDate).toLocaleString()}`);
    noteTimeStamp.setDisabled(true);

    noteTitle.setStyleSheet("text-align: center;");
    noteTimeStamp.setStyleSheet("text-align: center;");
    noteContent.setStyleSheet("text-align: center;");

    const noteLayout = new QGridLayout();
    
    noteLayout.addWidget(noteTitle);
    noteLayout.addWidget(noteTimeStamp, 2);
    noteLayout.addWidget(noteContent, 3);

    const note = new QDialog();
    note.setWindowTitle(`Viewing note "${doc.title}"`);
    note.isModal(true);
    note.setLayout(noteLayout);
    note.show();
}


async function setupAllNotes(client, username, layout, searchbar) {
    return new Promise(async (resolve) => {
        const allNotes = new QComboBox();
        allNotes.addItem(undefined, 'no note selected');
    
        const dbo = client.db('database_custom_1').collection(`${username}.notes`);
        const docs = await dbo.find().toArray();
        
        for (doc of docs) {
            notesMap.set(doc.title, doc);
        }
    
        allNotes.addItems(Array.from(notesMap.keys()));
        allNotes.addEventListener('activated', (ind) => {
            search(client, username, allNotes.itemText(ind), searchbar, layout);
        });
        layout.addWidget(allNotes, 0);

        resolve(true);
    });
}


/**
 * @param {QGridLayout} layout
 */
async function setupWindowNotes(client, username, sessionId, layout) {
    // const label = new QLabel();
    // label.setText("New Note");
    
    const newNoteBtn = new QPushButton();
    newNoteBtn.setText("New Note");
    newNoteBtn.addEventListener('clicked', async () => {
        const [title, content] = await createNewNoteDialogue(client, username);
        const dbo = client.db('database_custom_1').collection(`${username}.notes`);
        const doc = await dbo.findOne({titleLower: title.toLowerCase()});
        if (doc) { return alert("note with this title alreay exists!", "ERROR"); }

        const d = (new Date);
        d.setMilliseconds(0);
        dbo.insertOne({titleLower: title.toLowerCase(), title: title, content: content, lastEditDate: d.getTime()/1000});
    });

    const searchbar = new QLineEdit();
    searchbar.addEventListener('editingFinished', () => { search(client, username, searchbar.text(), searchbar, layout); });
    searchbar.addEventListener('textChanged', () => {searchbar.setStyleSheet("border-style: none;"); });

    await setupAllNotes(client, username, layout, searchbar);
    layout.addWidget(searchbar, 1);
    layout.addWidget(newNoteBtn, 2);
}


module.exports = setupWindowNotes;