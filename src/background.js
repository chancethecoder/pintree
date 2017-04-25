import { app, Menu } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import { fileMenuTemplate } from './menu/file_menu_template';
import { viewMenuTemplate } from './menu/view_menu_template';
import padController from './helpers/pad_control';
import db from './helpers/db';
import env from './env';

/*
 * User information
 */
let userInfo = {
    id: 'test',
    pw: 'secret',
}


/*
 * Save userData in separate folders for each environment.
 */
if (env.name !== 'production') {
    var userDataPath = app.getPath('userData');
    app.setPath('userData', userDataPath + '(' + env.name + ')');
}


/*
 * Start rendering
 */
var startRender = function () {
    db.getUser(userInfo.id)
    .then((user) => {
        padController.init(userInfo.id, user.pads); // Initialize controller

        // Build menus
        var menus = [fileMenuTemplate, editMenuTemplate, viewMenuTemplate];
        if (env.name !== 'production') {
            menus.push(devMenuTemplate);
        }
        Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
    })
    .catch( err => console.log(err) )
}


/*
 * Application start point.
 */
app.on('ready', function () {

    /**
     * TODO(chancethecoder@gmail.com): login feature as below
     * 1. get user's id/pw
     * 2. access db server (go to 1 if fails)
     * 3. get application state
     * 4. save application state
     */
    userInfo.id = 'test';
    userInfo.pw = 'secret';

    this.padController = padController; // Bind controller

    db.init() // Initialize local database
    .then((result) => { startRender() }) // This is first time user opened app.
    .catch((err) => { startRender() })
});


/*
 * Close application if all window closed.
 */
app.on('window-all-closed', function () {
    app.quit();
});
