import { app, BrowserWindow } from 'electron';

export var devMenuTemplate = {
    label: 'Development',
    submenu: [{
        label: 'Reload',
        accelerator: 'F5',
        click: function () { BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache() }
    },{
        label: 'Toggle DevTools',
        accelerator: 'F12',
        click: function () { BrowserWindow.getFocusedWindow().toggleDevTools() }
    }]
};
