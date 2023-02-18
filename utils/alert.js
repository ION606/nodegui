const { QWidget, QLabel, QPushButton, QIcon, QGridLayout, QDialog, QDial } = require('@nodegui/nodegui');

function alert(txt, title = "alert", icon = null, isConf = false) {
    return new Promise((resolve) => {
        const layout = new QGridLayout();
        const label = new QLabel();
        label.setText(txt);

        const ok = new QPushButton();
        ok.setText("OK");
        ok.setStyleSheet("margin: 10px;");
        ok.setFixedWidth(100);
    
        const window = new QDialog();
        window.setStyleSheet("margin: 10px;");

        ok.addEventListener('clicked', () => {
            resolve(true);
            window.close();
        });

        if (isConf) {
            const cancel = new QPushButton();
            cancel.setText("CANCEL");
            cancel.setFixedWidth(100);
            cancel.addEventListener('released', () => {
                resolve(false);
                window.close();
            })
            layout.addWidget(cancel, 2, 1);
        }

        window.setModal(true);
        layout.addWidget(label, 0);
        layout.addWidget(ok, 2);
        window.setLayout(layout);
        window.setWindowTitle(title);
        // window.setMaximumWidth(10); //DOES NOT WORK????
        // window.setMaximumHeight(10); //DOES NOT WORK????
        window.show();
    })
}

module.exports = alert;