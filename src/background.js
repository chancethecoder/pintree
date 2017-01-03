// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu } from 'electron';
import jetpack from 'fs-jetpack';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import { fileMenuTemplate } from './menu/file_menu_template';
import { viewMenuTemplate } from './menu/view_menu_template';
import MainController from './helpers/main_control';
import PadController from './helpers/pad_control';
import db from './helpers/db';
import env from './env';

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
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
// 1. bind the method in the main process
// 2. call the method to basic settings
// 3. create the main renderer process
app.on('ready', function () {

    // Bind controller
    this.MainController = MainController;
    this.PadController = PadController;
    this.user = 'test';

    db.getUser(this.user)
    .then( user => {
        MainController.init(this.user, user.pads);
        PadController.init(this.user, user.pads);
        setApplicationMenu();
    })
    .catch( err => console.log(err) )

});

app.on('window-all-closed', function () {
    app.quit();
});
