import { app, BrowserWindow, screen } from 'electron';

const window = require('electron-window')

// Controller Class
function Controller() {
    this.instances = [];
}

// Create new instance
Controller.prototype.create = function(props) {
    this.instances.push(new Instance(props));
    console.log(this.instances.length);
}

// Initialize
Controller.prototype.init = function(rows) {
    // console.log(object);
    for(let row of rows) {
        console.log(row.doc);
        this.instances.push(new Instance(row.doc));
    }
}

// Destroy window
Controller.prototype.destroy = function(id) {
    this.get(id).win = null;
}

// Getter
Controller.prototype.get = function(id) {
    for(let ins of this.instances) {
        if(ins.props.id == id) return ins;
    }
}

Controller.prototype.getState = function(id) {
    var ins = this.get(id);
    return ins.getState();
}

/*
// Initialize
Controller.prototype.init = function() {
    var path = app.getPath('userData') + "/" + env.settings.path;
    if(!jetpack.exists(path)) {
        console.log(path + ": there is no pad instances!");
        return;
    }
    var subdirs = jetpack.list(path);
    for (let subdir of subdirs) {
        try {
            var dir = jetpack.cwd(path + "/" + subdir);
            var file = dir.find({ matching: ['window-state-*'] });
            var state = dir.read(file[0], 'json');
            this.instances.push(new Instance(state));
        } catch (e) {

        };
    }
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
*/

// Pad Instance Class
function Instance(props) {
    this.props = props;
    this.win = null;
    this.init();
}

// Initialize
Instance.prototype.init = function() {
    this.win = window.createWindow(this.props.state);
    this.win.showURL(__dirname + '/pad.html', this.props, () => {
        this.win.show()
    });
    this.win.on('close', () => { });
}

// Getter
Instance.prototype.getState = function() {
    var position = this.win.getPosition();
    var size = this.win.getSize();
    return {
        x: position[0],
        y: position[1],
        width: size[0],
        height: size[1],
        frame: false
    };
}

/*

// Set instance's settings
Instance.prototype.setSettings = function(settings) {

    Object.assign(this.settings, settings);

    // This is first initialization of instance.
    // TO DO: change this to database's PK
    if(settings.id == "") {
        this.settings.id = moment().format('YYYYMMDDHHmmss');
        this.isFirst = true;
    }

    this.fullpath   = path.resolve(app.getPath('userData'), this.settings.path, this.settings.id);
    this.statefile  = 'window-state-' + this.settings.id +'.json';
    console.log(this.fullpath);
    console.log(this.settings);
}

// Render window view
Instance.prototype.renderWindow = function(isFirst) {

    // Get args to pass pad.html
    try {
        var content = jetpack.cwd(this.fullpath).read(this.settings.savefile, 'json');
    } catch(e) { console.log('savefile is not exist.'); }

    var args = {
        id: this.settings.id,
        isFirst: isFirst,
        content: content
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
*/

export default new Controller();
