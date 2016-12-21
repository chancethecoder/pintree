import { app, BrowserWindow } from 'electron';

export var viewMenuTemplate = {
    label: 'File',
    submenu: [{
        label: "New pad",
        accelerator: "CmdOrCtrl+N",
        click: function () { app.newPad() }
    },{
        type: "separator"
    },{
        label: "Quit",
        accelerator: "CmdOrCtrl+Q",
        click: function () { app.toggleHome() }
    }]
};
