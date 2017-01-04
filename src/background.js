import { app, Menu } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import { fileMenuTemplate } from './menu/file_menu_template';
import { viewMenuTemplate } from './menu/view_menu_template';
import MainController from './helpers/main_control';
import PadController from './helpers/pad_control';
import db from './helpers/db';
import env from './env';

// Save userData in separate folders for each environment.
if (env.name !== 'production') {
    var userDataPath = app.getPath('userData');
    app.setPath('userData', userDataPath + '(' + env.name + ')');
}

// Menu settings
var setApplicationMenu = function () {
    var menus = [fileMenuTemplate, editMenuTemplate, viewMenuTemplate];
    if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Application start point.
app.on('ready', function () {

    // Bind controller
    this.MainController = MainController;
    this.PadController = PadController;
    this.user = 'test';

    db.init()
    .then((result) => {
        db.getUser(this.user)
        .then( user => {
            this.MainController.init(this.user, user.pads);
            this.PadController.init(this.user, user.pads);
            setApplicationMenu();
        })
        .catch( err => console.log(err) )
    })
    .catch((err) => {

        db.getUser(this.user)
        .then( user => {
            this.MainController.init(this.user, user.pads);
            this.PadController.init(this.user, user.pads);
            setApplicationMenu();
        })
        .catch( err => console.log(err) )
    })
});

app.on('window-all-closed', function () {
    app.quit();
});
