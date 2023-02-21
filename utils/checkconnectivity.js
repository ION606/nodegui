const { QBoxLayout, QLabel, AlignmentFlag } = require('@nodegui/nodegui');


function checkConnection() {
    return new Promise((resolve) => {
        require('dns').resolve('www.google.com', function(err) {
            if (err) {
                // console.log("No connection");
                resolve(false);
            } else {
                // console.log("Connected");
                resolve(true);
            }
        });
    })
}


/**
 * @param {QBoxLayout} rootLayout 
 */
function setNoNetworkPage(rootLayout) {
    const label = new QLabel();
    label.setText("No internet connection\nPlease check your connectivity");
    label.setInlineStyle('color: white; text-align: center;');
    rootLayout.addWidget(label, undefined, AlignmentFlag.AlignCenter);
}


module.exports = { checkConnection, setNoNetworkPage }