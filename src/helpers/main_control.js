import { BrowserWindow } from 'electron';

// Main Instance Class
function Instance() {
    this.win = null;
}

// Initialize
Instance.prototype.init = function () {
    this.win = new BrowserWindow( { show: false } );
    this.win.loadURL('file://' + __dirname + '/app.html');
    this.win.on('close', () => {});
}

// Getter
Instance.prototype.getState = function () {
    var position = this.win.getPosition();
    var size = this.win.getSize();
    return {
        x: position[0],
        y: position[1],
        width: size[0],
        height: size[1]
    };
}

// Setter
Instance.prototype.setState = function (state) {
    console.log(state);
    this.win.setSize(state.width, state.height);
    this.win.setPosition(state.x, state.y);
    this.win.show();
}

// Destroy window
Instance.prototype.destroy = function () {
    this.win = null;
}

// Toggle window's visibility
Instance.prototype.toggle = function() {
    if(this.win.isDestroyed()) {
        this.init();
    } else {
        this.win.isVisible() ? this.win.hide() : this.win.show()
    }
}

export default new Instance();
