import { app, Menu } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import { fileMenuTemplate } from './menu/file_menu_template';
import { viewMenuTemplate } from './menu/view_menu_template';
import padController from './helpers/pad_control';
import db from './helpers/db';
import env from './env';


// Save userData in separate folders for each environment.
if (env.name !== 'production') {
    var userDataPath = app.getPath('userData');
    app.setPath('userData', userDataPath + '(' + env.name + ')');
}

// Start rendering
var startRender = function (userInfo = app.userInfo) {
    db.getUser(userInfo)
    .then((user) => {
        padController.init(user.pads);
        var menus = [fileMenuTemplate, editMenuTemplate, viewMenuTemplate];
        if (env.name !== 'production') {
            menus.push(devMenuTemplate);
        }
        Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
    })
    .catch( err => console.log(err) )
}

// Application start point.
app.on('ready', function () {

    /**
     * TODO(chancethecoder@gmail.com): login feature as below
     * - Implement login form to receive user information
     */
    var userInfo = {
        id: 'localhost',
        pw: 'secret',
        name: 'test',
    };

    this.userInfo = userInfo;
    this.padController = padController;

    /**
     * Connection process description.
     * 1. initialize local db's table with NO rejection
     * 2. then create user with rejection (prevent pad creation)
     * 3. then/catch start render process
     */
    db.init()
    .then((result) => db.createUser(this.userInfo, ''))
    .then((result) => { startRender() })
    .catch((err) => { startRender() })
});

// Close application if all window closed.
app.on('window-all-closed', function () {
    app.quit();
});
