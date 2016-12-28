import { app, BrowserWindow, screen } from 'electron';
import jetpack from 'fs-jetpack';
import moment from 'moment';
import env from '../env';

// Controller Class
function Controller() {
    this.instances = [];
}

// Initialize
Controller.prototype.init = function() {
    var path = app.getPath('userData') + "/" + env.pad.path;
    if(!jetpack.exists(path)) {
        console.log(path + ": there is no pad instances!");
        return;
    }
    var subdirs = jetpack.list(path);
    for (let subdir of subdirs) {
        try {
            var dir = jetpack.cwd(path + "/" + subdir);
            var file = dir.find({ matching: ['*.json'] });
            var state = dir.read(file[0], 'json');
            this.instances.push(new Instance(state));
        } catch (e) {

        };
    }
}

// Create new instance
Controller.prototype.create = function() {
    this.instances.push(new Instance(env.pad));
    console.log(this.instances.length);
}

// Return instance array
Controller.prototype.getAll = function() {
    return this.instances;
}

// Return instance
Controller.prototype.get = function(id) {
    for(let ins of this.instances) {
        if(ins.id == id) return ins;
    }
}

// Focus instance
Controller.prototype.focus = function(id) {
    for(let ins of this.instances) {
        if(ins.id == id) {
            if(ins.win.isDestroyed()) {
                // Create window
                ins.win = new BrowserWindow(ins.state);
                ins.win.loadURL('file://' + __dirname + '/pad.html');
                ins.win.once('ready-to-show', () => { ins.win.show() });
                ins.win.on('close', () => { ins.saveState() });
            }
            else ins.win.focus();
        }
    }
}

// Delete instance
Controller.prototype.remove = function(id) {
    for(let ins of this.instances) {
        if(ins.id == id) {
            console.log("delete:" + ins.id);
            ins.win.close();
            jetpack.remove(ins.fullpath);

            var idx = this.instances.indexOf(ins);
            if(idx != -1) {
                this.instances.splice(idx, 1);
                ins = null;
                console.log(this.instances.length);
            }
        }
    }
}

// Pad Instance Class
function Instance(settings) {

    this.id         = settings.id;

    // Check whether this instance is new
    if(settings.id == "") {
        // By default, dir is blank
        this.id = moment().format('YYYYMMDDHHmmss');
        // settings.id = this.id;
        console.log('create:' + this.id);
    }

    this.path       = settings.path;
    this.name       = settings.name;
    this.state      = settings.state;
    this.fullpath   = app.getPath('userData') + '/' + this.path + "/" + this.id;
    this.statefile  = 'window-state-' + this.id +'.json'

    // Create window
    this.win = new BrowserWindow(this.state);
    this.win.loadURL('file://' + __dirname + '/pad.html', this.state);
    this.win.once('ready-to-show', () => { this.win.show() });
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
    Object.assign(this.state, this.getWindowPosition());
    this.state.y -= 28; // Bug : why window get 28px for y-axis?

    // Write instance's information to JSON file
    jetpack.cwd(this.fullpath).write(
        this.statefile,
        {
            'path'  : this.path,
            'name'  : this.name,
            'id'    : this.id,
            'state' : this.state
        },
        { atomic: true }
    );
}

export default new Controller();
