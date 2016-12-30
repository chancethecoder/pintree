// This is main.html custom javascript.

import { remote } from 'electron';

var app = remote.app;

var id = null;

var renderSidebar = function() {
    $("#sidebar-pad-instances").empty().append(() => {
        var html = "";
        var instances = app.PadController.getAll();
        for(let instance of instances) {
            html += '<li>';
            html += '<div data-id="' + instance.settings.id + '">';
            html += '<a href="#" data-action="getId" data-toggle="modal" data-target="#rename-modal">' + instance.settings.name + '</a>';
            html += '<a href="#" data-remoteAction="focus"><i class="fa fa-eye" area-hidden="true"></i></a>';
            html += '<a href="#" data-remoteAction="remove"><i class="fa fa-trash-o" area-hidden="true"></i></a>';
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

    // Get id
    $(document).on('click', '[data-action="getId"]', function() {
        id = $(this).parent().data('id');
    });

    // Add event for focus pad
    $(document).on('click', '[data-remoteAction="focus"]', function() {
        app.PadController.focus($(this).parent().data('id'));
    });

    // Add event for delete pad
    $(document).on('click', '[data-remoteAction="remove"]', function() {
        app.PadController.remove($(this).parent().data('id'));
        renderSidebar();
    });

    // Add event for creating new pad
    $(document).on('click', '[data-remoteAction="create"]', function() {
        app.PadController.create();
        renderSidebar();
    });

    // Add event for rename pad
    $(document).on('click', '[data-remoteAction="rename"]', function() {
        var name = $('#rename-modal').find('#name').val();
        app.PadController.update(id, { name: name });
        renderSidebar();
    });

    // Render sidebar
    renderSidebar();
});
