// This is a script of app.html
// 1. handle events and use remote to ipc
// 2. make right click menus

import { remote } from 'electron';
import env from './env';

var app = remote.app;

var renderSidebar = function() {
    // Add pad instances to sidebar navigation
    $("#sidebar-pad-instances").empty().append(() => {
        var html = "";
        var pad = app.getPad();
        for(let win of pad) {
            html += '<li>';
            html += '<a href="#" data-id="' + win.id + '" data-target="focus-pad">pad-instance</a>';
            html += '</li>';
        }
        return html;
    });

    // Add event for focus pad
    $('[data-target="focus-pad"]').on('click', function() {
        // focus pad
        app.focusPad($(this).data('id'));
    });
}

document.addEventListener('DOMContentLoaded', function () {

    // Do something on loaded
    const { Menu, MenuItem } = remote
    const menu = new Menu()

    menu.append(new MenuItem({label: 'New pad', click() { app.newPad() }}))
    menu.append(new MenuItem({label: 'Hide home', click() { app.toggleHome() }}))

    window.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        menu.popup(remote.getCurrentWindow())
    }, false)

    // Init sidenav toggle
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $("#pad-wrapper").toggleClass("toggled");
    });

    // Bootstrap Tooltip
    $('[data-toggle="tooltip"]').tooltip();

    // Add event for creating new pad
    $('[data-target="new-pad"]').on('click', function() {
        // create pad
        app.newPad();
        // refresh sidebar
        renderSidebar();
    });

    // Render sidebar
    renderSidebar();

});
