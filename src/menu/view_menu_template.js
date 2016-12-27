import { app, BrowserWindow } from 'electron';

export var viewMenuTemplate = {
    label: 'View',
    submenu: [{
        label: "Show All Window",
        accelerator: "CmdOrCtrl+Shift+A",
        click: function () {
            var wins = BrowserWindow.getAllWindows()
            for (let win of wins) win.show();
        }
    },{
        type: "separator"
    },{
        label: "Toggle Full Screen",
        accelerator: "F11",
        click: function () { BrowserWindow.getFocusedWindow().maximize() }
    },{
        label: "Toggle This window's Visibility",
        accelerator: "CmdOrCtrl+Shift+T",
        click: function () { BrowserWindow.getFocusedWindow().hide() }
    },{
        label: "Toggle Home Visibility",
        accelerator: "CmdOrCtrl+Shift+H",
        click: function () { app.MainController.toggle() }
    }]
};
