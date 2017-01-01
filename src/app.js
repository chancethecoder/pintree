// This is overall custom javascript.
// apply to all of html pages

import { remote } from 'electron';

var app = remote.app;

document.addEventListener('DOMContentLoaded', function () {

    // Do something on loaded
    const { Menu, MenuItem } = remote
    const menu = new Menu()

    menu.append(new MenuItem({label: 'New pad', click() { app.PadController.create() }}))
    menu.append(new MenuItem({label: 'Hide home', click() { app.MainController.toggle() }}))

    window.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        menu.popup(remote.getCurrentWindow())
    }, false)

    $('[data-toggle="tooltip"]').tooltip();
});
