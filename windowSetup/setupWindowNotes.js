const { QDialog, Direction, QAction, QPixmap, QBoxLayout, QPushButton, QLineEdit, QTextEdit, QLabel, QKeySequence, QShortcut, QGridLayout, QComboBox } = require("@nodegui/nodegui");
const path = require('path');
const alert = require("../utils/alert");



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
    });
}


async function search(client, username, txt, bar, layout) {
    const dbo = client.db('database_custom_1').collection(`${username}.notes`);
    const doc = await dbo.findOne({titleLower: txt.toLowerCase()});
    if (!doc) { return bar.setStyleSheet("border-width: 1px; border-color: red; border-style: solid;"); }

    const note = new QDialog();
    const noteTitle = new QLabel();
    const noteContent = new QTextEdit();
    const noteTimeStamp = new QLabel();

    noteTitle.setText(doc.title);
    noteContent.setText(doc.content);
    noteTimeStamp.setText(`Last edited at ${new Date(doc.lastEditDate).toLocaleString()}`);
    noteTimeStamp.setDisabled(true);

    noteTitle.setInlineStyle("text-align: center; font-size: 20px;");
    noteTimeStamp.setInlineStyle("text-align: center; margin-bottom: 15px;");
    noteContent.setInlineStyle("text-align: center;");
    noteContent.addEventListener('textChanged', () => {
        note.setWindowTitle(`Viewing note "${doc.title}"  (unsaved)`);
    });

    const delBtn = new QPushButton();
    delBtn.setText("Delete");
    delBtn.setInlineStyle('margin-top: 20px;');
    delBtn.addEventListener('released', async () => {
        const conf = await alert(`Are you sure you want to delete "${doc.title}"?`, "confirmation", null, true);
        if (conf) {
            await dbo.deleteOne({titleLower: txt.toLowerCase()});
            await alert('Note deletd!');
            await setupAllNotes(client, username, layout, bar, true);
            note.close();
        }
    });
    
    const submitBtn = new QPushButton();
    submitBtn.setText("Submit");
    submitBtn.setInlineStyle('margin-top: 20px;');
    submitBtn.addEventListener('released', async () => {
        const newContent = noteContent.toPlainText();
        const editDate = new Date().getTime()/1000;

        await dbo.updateOne({titleLower: txt.toLowerCase()}, {$set: {content: newContent, lastEditDate: editDate}});
        await alert("note updated!");
        note.close();
    });


    
    const noteLayout = new QGridLayout();

    const keyEvent = new QAction();
    keyEvent.setShortcut(new QKeySequence('CTRL+S'));
    keyEvent.addEventListener('triggered', async () => {
        const newContent = noteContent.toPlainText();
        const editDate = new Date().getTime()/1000;
        await dbo.updateOne({titleLower: txt.toLowerCase()}, {$set: {content: newContent, lastEditDate: editDate}});
        note.setWindowTitle(`Viewing note "${doc.title}"  (saved)`);
    });

    noteContent.addAction(keyEvent);
    
    noteLayout.addWidget(noteTitle);
    noteLayout.addWidget(noteTimeStamp, 2);
    noteLayout.addWidget(noteContent, 3);
    noteLayout.addWidget(submitBtn, 4);
    noteLayout.addWidget(delBtn, 5);

    note.setWindowTitle(`Viewing note "${doc.title}"  (saved)`);
    note.isModal(true);
    note.setLayout(noteLayout);
    note.show();
}


/**
 * @param {QGridLayout} layout
 */
async function setupAllNotes(client, username, layout, searchbar, replacing = false) {
    return new Promise(async (resolve) => {
        var allNotes;
        const notesMap = new Map();

        if (replacing) {
            const obj = layout.parent().children().find((child) => child.objectName() == "all_notes");
            obj.deleteLater();
            layout.removeWidget(obj);
        }

        allNotes = new QComboBox();

        allNotes.setObjectName("all_notes");
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
        if (replacing) layout.update();

        resolve(true);
    });
}


/**
 * @param {QGridLayout} layout
 */
async function setupWindowNotes(client, username, sessionId, layout) {
    // const label = new QLabel();
    // label.setText("New Note");

    const searchbar = new QLineEdit();
    searchbar.setObjectName("searchbar");
    searchbar.addEventListener('editingFinished', () => { search(client, username, searchbar.text(), searchbar, layout); });
    searchbar.addEventListener('textChanged', () => {searchbar.setStyleSheet("border-style: none;"); });
    
    const newNoteBtn = new QPushButton();
    newNoteBtn.setObjectName("newNoteBtn")
    newNoteBtn.setText("New Note");
    newNoteBtn.addEventListener('clicked', async () => {
        const [title, content] = await createNewNoteDialogue(client, username);
        const dbo = client.db('database_custom_1').collection(`${username}.notes`);
        const doc = await dbo.findOne({titleLower: title.toLowerCase()});
        if (doc) { return alert("note with this title alreay exists!", "ERROR"); }

        const d = (new Date);
        d.setMilliseconds(0);
        await dbo.insertOne({titleLower: title.toLowerCase(), title: title, content: content, lastEditDate: d.getTime()/1000});
        setupAllNotes(client, username, layout, searchbar, true);
    });

    await setupAllNotes(client, username, layout, searchbar);
    layout.addWidget(searchbar, 1);
    layout.addWidget(newNoteBtn, 2);
}


module.exports = setupWindowNotes;