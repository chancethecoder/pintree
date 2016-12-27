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
}

// Create new instance
Controller.prototype.get = function() {
    return this.instances;
}

// Focus instance
Controller.prototype.focus = function(instance) {
    instance.win.focus();
}

// Delete instance
Controller.prototype.remove = function(instance) {

}

// Test
Controller.prototype.test = function() {
    console.log('it work!');
}


// Pad Instance Class
function Instance(settings) {
    console.log(settings);

    this.fullpath   = app.getPath('userData') + '/' + settings.path + "/" + settings.dir;
    this.statefile  = '/window-state-' + settings.dir +'.json'
    this.path       = settings.path;
    this.name       = settings.name;
    this.dir        = settings.dir;
    this.state      = settings.state;

    // Check whether this instance is new
    if(this.dir == "") {
        // By default, dir is blank
        this.dir = moment().format('YYYYMMDDHHmmss');
        settings.dir = this.dir;
        console.log('create:' + settings.dir);
    }

    // Create window
    this.win = new BrowserWindow(this.state);
    this.win.loadURL('file://' + __dirname + '/pad.html');
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
    jetpack.cwd(this.path).write(
        this.fullpath + "/" + this.statefile,
        {
            'path'  : this.path,
            'name'  : this.name,
            'dir'   : this.dir,
            'state' : this.state
        },
        { atomic: true }
    );
}

export default new Controller();
