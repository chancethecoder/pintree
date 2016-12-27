// This is main.html custom javascript.

import { remote } from 'electron';

var app = remote.app;

var renderSidebar = function() {
    $("#sidebar-pad-instances").empty().append(() => {
        var html = "";
        var instances = app.PadController.getAll();
        for(let instance of instances) {
            html += '<li>';
            html += '<a href="#" data-id="' + instance.id + '" data-target="focus-pad">pad-instance</a>';
            html += '</li>';
        }
        return html;
    });

    // Add event for focus pad
    $('[data-target="focus-pad"]').on('click', function() {
        app.PadController.focus($(this).data('id'));
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
        var instance = app.PadController.get($(this).data('id'));
        app.PadController.remove(instance);
        renderSidebar();
    });

    // Add event for creating new pad
    $('[data-target="new-pad"]').on('click', function() {
        app.PadController.create();
        renderSidebar();
    });

    // Render sidebar
    renderSidebar();

});
