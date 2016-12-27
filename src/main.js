// This is main.html custom javascript.

import { remote } from 'electron';

var app = remote.app;

var renderSidebar = function() {
    // Add pad instances to sidebar navigation
    $("#sidebar-pad-instances").empty().append(() => {
        var html = "";
        var pad = app.getPad();
        for(let instance of pad) {
            html += '<li>';
            html += '<a href="#" data-id="' + instance.win.id + '" data-target="focus-pad">pad-instance</a>';
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

    // Init sidenav toggle
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $("#pad-wrapper").toggleClass("toggled");
    });

    // Add event for creating new pad
    $('[data-target="delete-pad"]').on('click', function() {
        // create pad
        app.deletePad();
        // refresh sidebar
        renderSidebar();
    });

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
