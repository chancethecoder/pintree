// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.
import { app, Menu } from 'electron';
import jetpack from 'fs-jetpack';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import { viewMenuTemplate } from './menu/view_menu_template';
import createWindow from './helpers/create_home';
import createPad from './helpers/create_pad';
import restorePad from './helpers/restore_pad';
import env from './env';

// Global variables in main process
let mainWindow;
let padWindow = [];

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
    var userDataPath = app.getPath('userData');
    app.setPath('userData', userDataPath + '(' + env.name + ')');
}

// Menu settings
var setApplicationMenu = function () {
    var menus = [editMenuTemplate, viewMenuTemplate];
    if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Make new pad with default setting
var newPad = function() {
    // Create default pad
    var pad = createPad(env.default_pad);
    pad.loadURL('file://' + __dirname + '/pad.html');
    pad.once('ready-to-show', () => {
        pad.show();
    });
    padWindow.push(pad);
}

// Toggle Main window's visibility
var toggleHome = function() { mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show() }

// Application start point.
// 1. bind the method in the main process
// 2. call the method to basic settings
// 3. create the main renderer process
app.on('ready', function () {

    // Bind methods
    this.setApplicationMenu = setApplicationMenu;
    this.newPad = newPad;
    this.toggleHome = toggleHome;

    // Call initial settins methods
    setApplicationMenu();
    padWindow = restorePad();

    // Create main window
    mainWindow = createWindow('main', env.default_main);
    mainWindow.loadURL('file://' + __dirname + '/app.html');
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if (env.name === 'development') {
        mainWindow.openDevTools();
    }
});

app.on('window-all-closed', function () {
    app.quit();
});
