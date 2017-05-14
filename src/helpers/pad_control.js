import { app, BrowserWindow, screen } from 'electron';
import env from '../env';
import db from './db';

const window = require('electron-window');

/**
 * Pad controller
 * @constructor
 */
function Controller() {
    this.instances = [];
}


/**
 * Initialize controller
 * @param {Object} pads
 */
Controller.prototype.init = function(pads) {
    pads.forEach( pad => {
        this.instances.push(new Instance(pad));
    })
}

/**
 * Create new instance
 * TODO : Get default settings from DB and remove env file
 */
Controller.prototype.create = function() {
    return db.createPad(app.userInfo.id)
    .then( result => {
        env.settings.id = result.insertId;
        this.instances.unshift(new Instance(env.settings));
    })
}

// Return instance array
Controller.prototype.getAll = function() {
    return this.instances;
}

// Return instance
Controller.prototype.get = function(id) {
    for(let ins of this.instances) {
        if(ins.settings.id == id) return ins;
    }
}

// Focus instance
Controller.prototype.focus = function(id) {
    let ins = this.get(id);
    if(ins.win.isDestroyed())
        ins.renderWindow();
    else
        ins.win.focus();
}

// Delete instance
Controller.prototype.remove = function(id) {

    return db.removePad(id)
    .then(result => {
        let ins = this.get(id);
        if(!ins.win.isDestroyed())
            ins.win.close();
        var idx = this.instances.indexOf(ins);
        if(idx != -1) {
            this.instances.splice(idx, 1);
            ins = null;
        }
    })
    .catch(err => console.log(err));
}

// Save content
Controller.prototype.save = function(id, content) {

    return db.savePad(id, content)
    .then( result => {
        let ins = this.get(id)
        ins.settings.revisions.unshift({
            id: ins.settings.revisions.length + 1,
            content,
            dt: new Date().toISOString().replace('T', ' ').replace(/\..*/, '')
        })
    })
}

// Update instance
Controller.prototype.update = function(id, name) {
    let ins = this.get(id);
    ins.settings.name = name

    return db.saveWindow(ins.settings)
    .then( result => console.log(result) )
    .catch( err => console.log(err) )
}

// Pad Instance Class
function Instance(settings) {
    this.win = null;
    this.settings = {}
    Object.assign(this.settings, settings);
    this.renderWindow();
}

// Render window view
Instance.prototype.renderWindow = function() {

    let args = {
        id: this.settings.id,
        content: this.settings.revisions[0]
          ? this.settings.revisions[0].content
          : ''
    }

    // Create window
    this.win = window.createWindow(this.settings.state);
    this.win.showURL(__dirname + '/pad.html', args, () => {
        this.win.show()
    });
    this.win.on('close', () => { this.saveState() });
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

    // Update current instance's window position
    Object.assign(this.settings.state, this.getWindowPosition());

    db.saveWindow(this.settings)
    .then( result => console.log(result) )
    .catch( err => console.log(err) )
}

export default new Controller();
