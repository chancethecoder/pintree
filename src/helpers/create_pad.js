// This helper remembers configurations of pad.
// Can be used for more than one window, just construct many
// instances of it and give each different name.

import { app, BrowserWindow, screen } from 'electron';
import jetpack from 'fs-jetpack';
import moment from 'moment';
import env from '../env';

export default function (options) {
    // Resolve to saved pad directory
    var path = app.getPath('userData') + '/' + options.path;
    var name = options.name;

    if(name == "") {
        // By default, if name is blank,
        // This pad is new created.
        name = moment().format('YYYYMMDDHHmmss');
        console.log(name);
    }
    path += "/" + name;

    var padDir = jetpack.cwd(path);
    var stateStoreFile = 'window-state-' + name +'.json';
    var defaultState = env.default_pad;
    var state = {};
    var win;

    var restore = function () {
        var restoredState = {};
        try {
            restoredState = padDir.read(stateStoreFile, 'json');
        } catch (err) {
            // For some reason json can't be read (might be corrupted).
            // No worries, we have defaults.
        }
        return Object.assign({}, defaultState, restoredState);
    };

    var getCurrentPosition = function () {
        var position = win.getPosition();
        var size = win.getSize();
        return {
            x: position[0],
            y: position[1],
            width: size[0],
            height: size[1]
        };
    };

    var windowWithinBounds = function (windowState, bounds) {
        return windowState.x >= bounds.x &&
            windowState.y >= bounds.y &&
            windowState.x + windowState.width <= bounds.x + bounds.width &&
            windowState.y + windowState.height <= bounds.y + bounds.height;
    };

    var resetToDefaults = function (windowState) {
        var bounds = screen.getPrimaryDisplay().bounds;
        return Object.assign({}, defaultState, {
            x: (bounds.width - defaultState.width) / 2,
            y: (bounds.height - defaultState.height) / 2
        });
    };

    var ensureVisibleOnSomeDisplay = function (windowState) {
        var visible = screen.getAllDisplays().some(function (display) {
            return windowWithinBounds(windowState, display.bounds);
        });
        if (!visible) {
            // Window is partially or fully not visible now.
            // Reset it to safe defaults.
            console.log("reset to default pad");
            return resetToDefaults(windowState);
        }
        return windowState;
    };

    // Save when this window closed
    var saveState = function () {
        if (!win.isMinimized() && !win.isMaximized()) {
            console.log('x:' + state.x + ' / y:' + state.y);
            Object.assign(state, getCurrentPosition());
            console.log('x:' + state.x + ' / y:' + state.y);
        }
        // Write a files to current window's directory

        // Need to save file name to .json file
        state.name = name;

        padDir.write(
            path + "/" + stateStoreFile,
            state,
            { atomic: true }
        );
    };

    // state = ensureVisibleOnSomeDisplay(restore());
    state = restore();

    win = new BrowserWindow(Object.assign({}, options, state));

    win.on('close', saveState);

    return win;
}
