import { app, BrowserWindow } from 'electron';

export var viewMenuTemplate = {
    label: 'View',
    submenu: [{
        label: "Show All Window",
        accelerator: "CmdOrCtrl+Shift+A",
        click: function () {
            var wins = BrowserWindow.getAllWindows()
            for (var i = 0, len = wins.length; i < len; i++) {
                wins[i].show();
            }
        }
    },{
        type: "separator"
    },{
        label: "Toggle Full Screen",
        accelerator: "F11",
        click: function () { BrowserWindow.getFocusedWindow().maximize() }
    },{
        label: "Toggle Visibility",
        accelerator: "CmdOrCtrl+T",
        click: function () { BrowserWindow.getFocusedWindow().hide() }
    },{
        label: "Toggle Home Visibility",
        accelerator: "CmdOrCtrl+H",
        click: function () { app.toggleHome() }
    }]
};
