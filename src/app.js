// This is a script of app.html
// 1. handle events and use remote to ipc
// 2. make right click menus

import { remote } from 'electron';
import env from './env';

var app = remote.app;

document.addEventListener('DOMContentLoaded', function () {

    // Do something on loaded
    const { Menu, MenuItem } = remote
    const menu = new Menu()

    menu.append(new MenuItem({label: 'New pad', click() { app.newPad() }}))
    menu.append(new MenuItem({label: 'Hide', click() { app.toggleHome() }}))

    window.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        menu.popup(remote.getCurrentWindow())
    }, false)

    // Init sidenav toggle
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });

    // Renderer process part for ipc
    $('#new-pad').on('click', function() {
        app.newPad();
    });
});
