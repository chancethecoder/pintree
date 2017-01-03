import { app, BrowserWindow, screen } from 'electron';
import jetpack from 'fs-jetpack';
import moment from 'moment';
import path from 'path';
import env from '../env';
import db from './db'

const window = require('electron-window')

// Controller Class
function Controller() {
    this.instances = [];
    this.user = null;
}

// Initialize
Controller.prototype.init = function(user, pads) {
    this.user = user
    pads.forEach( pad => {
        this.instances.push(new Instance(pad));
    })
}

// Create new instance
Controller.prototype.create = function() {
    return db.createPad(this.user, env.settings.name, env.settings.state)
    .then( result => {
        env.settings.id = result.insertId;
        this.instances.push(new Instance(env.settings, true));
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
    let ins = this.get(id);
    if(!ins.win.isDestroyed())
        ins.win.close();
    db.removePad(id);

    var idx = this.instances.indexOf(ins);
    if(idx != -1) {
        this.instances.splice(idx, 1);
        ins = null;
        console.log(this.instances.length);
    }
}

// Save content
Controller.prototype.save = function(id, content) {
    let ins = this.get(id);
    ins.settings.revisions.unshift({id, content, dt: new Date()})

    db.savePad(id, content)
    .then( result => console.log(result) )
    .catch( err => console.log(err) )
}

// Update instance
Controller.prototype.update = function(id, settings) {
    let ins = this.get(id);
    ins.setSettings(settings);
}

// Pad Instance Class
function Instance(settings, isFirst = false) {
    this.win = null;
    this.settings = {}
    Object.assign(this.settings, settings);
    this.renderWindow(isFirst);
}

// Render window view
Instance.prototype.renderWindow = function(isFirst) {

    var args = {
        id: this.settings.id,
        isFirst: isFirst,
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

    console.log(this.settings);

    db.saveWindow(this.settings.id, this.settings.state)
    .then( result => console.log(result) )
    .catch( err => console.log(err) )
}

export default new Controller();
