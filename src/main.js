// This is main.html custom javascript.

import { remote } from 'electron';

var app = remote.app;

var id = null;

var renderTimeline = function() {
    $(".page-content ul").empty().append(() => {
        var html = "";
        var instances = app.PadController.getAll();
        for(let instance of instances) {
            var revs = instance.settings.revisions
            html += '<li>'
            if (!revs.length) {
                html += '<div class="block">'
                html += '<div class="tags">'
                html += '<a href="" class="tag">'
                html += '<span>' + instance.settings.name + '</span>'
                html += '</a>'
                html += '</div>'
                html += '<div class="block_content">'
                html += '<h2 class="title"><a>Empty Revision..</a></h2>'
                html += '<div class="byline">'
                html += '<span>no revision</span>'
                html += '</div>'
                html += '<p class="excerpt">any content is written yet.</p>'
                html += '</div>'
                html += '</div>'
            }
            for(let rev of revs) {
                html += '<div class="block">'
                html += '<div class="tags">'
                html += '<a href="" class="tag">'
                html += '<span>' + instance.settings.name + '</span>'
                html += '</a>'
                html += '</div>'
                html += '<div class="block_content">'
                html += '<h2 class="title">'
                html += '<a>' + rev.dt + '</a>'
                html += '</h2>'
                html += '<div class="byline">'
                html += '<span>revision id: </span><a>' + rev.id + '</a>'
                html += '</div>'
                html += '<p class="excerpt">' + rev.content.ops.reduce( (p,n) => p + n.insert.replace(/\n/g, '<br>'), '' ) + '</p>'
                html += '</div>'
                html += '</div>'
            }
            html += '</li>'
        }
        return html;
    })
}

var renderSidebar = function() {
    $(".sidebar-body-list").empty().append(() => {
        var html = "";
        var instances = app.PadController.getAll();
        for(let instance of instances) {
            html += '<li data-id="' + instance.settings.id + '">';
            html += '<a href="#" data-toggle="modal" data-target="#rename-modal">' + instance.settings.name + '</a>';
            html += '<a href="#" data-remoteAction="focus"><i class="fa fa-eye" area-hidden="true"></i></a>';
            html += '<a href="#" data-remoteAction="remove"><i class="fa fa-trash-o" area-hidden="true"></i></a>';
            html += '</li>';
        }
        return html;
    });
}

setInterval(()=>{
    renderSidebar()
    renderTimeline()
}, 1000);

document.addEventListener('DOMContentLoaded', function () {

    // Init sidenav toggle
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $("#pad-wrapper").toggleClass("toggled");
    });

    // Get id
    $(document).on('mouseover', '.sidebar-body-list li', function() {
        id = $(this).data('id');
    });

    // Add event for focus pad
    $(document).on('click', '[data-remoteAction="focus"]', function() {
        app.PadController.focus(id);
    });

    // Add event for delete pad
    $(document).on('click', '[data-remoteAction="remove"]', function() {
        app.PadController.remove(id);
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
        if(name == "") return;
        app.PadController.update(id, { name: name });
        renderSidebar();
    });

    // Render sidebar
    renderSidebar();
    renderTimeline();
});
