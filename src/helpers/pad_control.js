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
}

// Initialize
Controller.prototype.init = function() {
    db.getUser('test')
    .then( user => {
        user.pads.map( pad => {
            this.instances.push(new Instance(pad));
        })
    })
    .catch( err => console.log(err) )
}

// Create new instance
Controller.prototype.create = function() {
    this.instances.push(new Instance(env.settings));
    console.log(this.instances.length);
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
    jetpack.remove(ins.fullpath);

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
    console.log("save:" + ins.settings.id);
    console.log("fullpath:" + ins.fullpath);
    console.log("savefile:" + ins.settings.savefile);
    console.log("content:" + content);

    jetpack.cwd(ins.fullpath).write(
        ins.settings.savefile,
        content,
        { atomic: true }
    );
}

// Update instance
Controller.prototype.update = function(id, settings) {
    let ins = this.get(id);
    ins.setSettings(settings);
}

// Pad Instance Class
function Instance(settings) {
    this.win = null;
    this.isFirst = settings ? false : true;
    this.settings = {}
    Object.assign(this.settings, settings);
    this.renderWindow(this.isFirst);
}

// Render window view
Instance.prototype.renderWindow = function(isFirst) {

    var args = {
        id: this.settings.id,
        isFirst: isFirst,
        content: this.settings.revisions[0].content || ''
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

    console.log(this.fullpath);
    console.log(this.settings);

    // Write instance's information to JSON file
    jetpack.cwd(this.fullpath).write(
        this.statefile,
        this.settings,
        { atomic: true }
    );
}

export default new Controller();
