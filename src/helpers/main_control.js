import { app, BrowserWindow, screen } from 'electron';
import jetpack from 'fs-jetpack';

const window = require('electron-window')

// Main Instance Class
function Instance() {
    this.win = null;
    this.user = null;
}

// Initialize
Instance.prototype.init = function (user, pads) {
    this.fullpath = app.getPath('userData');
    this.statefile = 'window-state-main.json';
    this.dir = jetpack.cwd(this.fullpath);
    this.state = this.restore();

    var args = pads;

    // Create window
    this.win = window.createWindow(this.state);
    this.win.showURL(__dirname + '/app.html', args, () => {
        this.win.show()
    });
    this.win.once('ready-to-show', () => { this.win.show() });
    this.win.on('close', () => { this.saveState() });
}

// Restore window state
Instance.prototype.restore = function() {
    var restoredState = {};
    try {
        restoredState = this.dir.read(this.statefile, 'json');
    } catch (err) {
        // For some reason json can't be read (might be corrupted).
        // No worries, we have defaults.
    }
    return Object.assign({}, { width: 800, height: 600 }, restoredState);
}

// Get current window's position and size
Instance.prototype.getWindowPosition = function() {
    var position = this.win.getPosition();
    var size = this.win.getSize();
    return {
        x: position[0],
        y: position[1],
        width: size[0],
        height: size[1]
    };
}

// Save when this instance's window closed
Instance.prototype.saveState = function() {
    Object.assign(this.state, this.getWindowPosition());
    this.dir.write(this.statefile, this.state, { atomic: true });
}

Instance.prototype.toggle = function() {
    if(this.win.isDestroyed()) {
        this.init();
    } else {
        this.win.isVisible() ? this.win.hide() : this.win.show()
    }
}

export default new Instance();
