// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import createWindow from './helpers/window';
import createPad from './helpers/pad';
import jetpack from 'fs-jetpack';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

const {ipcMain} = require('electron');

var mainWindow;

// Set application's menu
var setApplicationMenu = function () {
    var menus = [editMenuTemplate];
    if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
    var userDataPath = app.getPath('userData');
    app.setPath('userData', userDataPath + ' (' + env.name + ')');
}

// Restore pad instances
var restoreInstances = function () {
    var path = app.getPath('userData') + "/" + env.default_pad.path;

    // there is no pad instances
    if(!jetpack.exists(path)) {
        console.log(path + ": there is no pad instances!");
        return;
    }

    // list path's subdirectory
    var subdirs = jetpack.list(path);

    // make instances for each sub directory
    for (let subdir of subdirs) {
        var dir = jetpack.cwd(path + "/" + subdir);
        var file = dir.find({ matching: ['*.json'] });
        if(file == null) {
            console.log("json file is not exist!");
            return;
        }
        var restoredState = dir.read(file[0], 'json');
        if(restoredState == null) {
            console.log('json file read file error!');
            continue;
        }
        var pad = createPad(restoredState);
        pad.loadURL('file://' + __dirname + '/pad.html');
    }
};

app.on('ready', function () {
    setApplicationMenu();
    restoreInstances();

    var mainWindow = createWindow('main', {
        width: 1000,
        height: 600
    });

    mainWindow.loadURL('file://' + __dirname + '/app.html');

    if (env.name === 'development') {
        mainWindow.openDevTools();
    }
});

app.on('window-all-closed', function () {
    app.quit();
});

// Main process part for ipc.
ipcMain.on('asynchronous-message', (event, arg) => {

    if(arg === 'new-pad') {
        // Create default pad
        var padWindow = createPad(env.default_pad);
        // Load pad.html
        padWindow.loadURL('file://' + __dirname + '/pad.html');
    }

});
