// This is main.html custom javascript.

import { remote } from 'electron';

var app = remote.app;

var renderSidebar = function() {
    $("#sidebar-pad-instances").empty().append(() => {
        var html = "";
        var instances = app.PadController.getAll();
        for(let instance of instances) {
            html += '<li>';
            html += '<div data-id="' + instance.id + '">';
            html += '<a href="#">pad-instance</a>';
            html += '<a href="#" data-target="focus-pad"><i class="fa fa-eye" area-hidden="true"></i></a>';
            html += '<a href="#" data-target="delete-pad"><i class="fa fa-trash-o" area-hidden="true"></i></a>';
            html += '</div>';
            html += '</li>';
        }
        return html;
    });

}

document.addEventListener('DOMContentLoaded', function () {

    // Init sidenav toggle
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $("#pad-wrapper").toggleClass("toggled");
    });

    // Add event for focus pad
    $(document).on('click', '[data-target="focus-pad"]', function() {
        app.PadController.focus($(this).parent().data('id'));
    });

    // Add event for creating new pad
    $(document).on('click', '[data-target="delete-pad"]', function() {
        app.PadController.remove($(this).parent().data('id'));
        renderSidebar();
    });

    // Add event for creating new pad
    $(document).on('click', '[data-target="new-pad"]', function() {
        app.PadController.create();
        renderSidebar();
    });

    // Render sidebar
    renderSidebar();
});
