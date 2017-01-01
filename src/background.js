// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import { fileMenuTemplate } from './menu/file_menu_template';
import { viewMenuTemplate } from './menu/view_menu_template';
import MainController from './helpers/main_control';
import PadController from './helpers/pad_control';
import env from './env';

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
    this.MainController.init();

    // Call initial settins methods
    setApplicationMenu();

});

app.on('window-all-closed', function () {
    app.quit();
});
