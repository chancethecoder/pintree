// This is main.html custom javascript.

import { remote } from 'electron';

var app = remote.app;

var args = window.__args__;

var id = null;

var renderTimeline = function() {
    $(".page-content ul").empty().append(() => {
        var html = "";
        var instances = app.PadController.getAll();
        for(let instance of instances) {
            var revs = instance.settings.revisions
            html += '<li>'
            /* preview div */
            html += '<div class="preview-layer">'
            html += '<div class="top">'
            html += '</div>'
            html += '<div class="bottom">'
            html += '<a class="toggle btn btn-round btn-default" role="button">see more</a>'
            html += '</div>'
            html += '</div>'
            /* /preview div */
            /* toolbar div */
            html += '<div class="toolbar-layer">'
            html += '<div class="btn-group">'
            html += '<a class="toggle btn btn-default" role="button" data-toggle="tooltip" data-placement="bottom" title="Collapse">'
            html += '<i class="fa fa-compress"></i>'
            html += '</a>'
            html += '<a class="btn btn-default" role="button"><i class="fa fa-ellipsis-v"></i></a>'
            html += '</div>'
            html += '</div>'
            /* /toolbar div */
            if (!revs.length) {
                html += '<div class="block">'
                html += '<div class="tags">'
                html += '<a href="#" class="tag">'
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
                html += '<a href="#" class="tag">'
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

    $(".page-content ul li").each(function (index) {
        if($(this).height() > 200) {
            $(this).toggleClass("preview");
        } else {
            $(this).toggleClass("non-preview");
        }
    })
}

var renderSidebar = function() {
    $(".sidebar-body-list").empty().append(() => {
        var html = "";
        var instances = app.PadController.getAll();
        for(let instance of instances) {
            html += '<li data-id="' + instance.settings.id + '">';
            html += '<div class="name">'
            html += '<a href="#" data-action="rename" data-toggle="tooltip" data-placement="top" title="Rename">' + instance.settings.name + '</a>';
            html += '</div>'
            html += '<div class="toolset">'
            html += '<a href="#" data-remoteAction="focus" data-toggle="tooltip" data-placement="top" title="Focus">'
            html += '<i class="fa fa-eye" area-hidden="true"></i>'
            html += '</a>';
            html += '<a href="#" data-remoteAction="remove" data-toggle="tooltip" data-placement="top" title="delete">'
            html += '<i class="fa fa-trash-o" area-hidden="true"></i>'
            html += '</a>';
            html += '</div>'
            html += '</li>';
        }
        return html;
    });
}

var render = function() {
    renderSidebar();
    renderTimeline();
    $('[data-toggle="tooltip"]').tooltip();
}

document.addEventListener('DOMContentLoaded', function () {

    // Toggle event
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $("#pad-wrapper").toggleClass("toggled");
    });

    $(document).on('click', ".page-content ul li a.toggle", function (index) {
        var $li = $(this).closest('li');
        $li.toggleClass('preview');
    })

    // Mouseover event
    $(document).on('mouseover', '.sidebar-body-list li', function() {
        id = $(this).data('id');
    });

    // Click event
    $(document).on('click', '[data-action="refresh"]', function() {
        render();
    });

    $(document).on('click', '[data-action="rename"]', function() {
        $('#rename-modal').modal();
    });

    $(document).on('click', '[data-remoteAction="focus"]', function() {
        app.PadController.focus(id);
    });

    $(document).on('click', '[data-remoteAction="remove"]', function() {
        app.PadController.remove(id)
        .then(render())
    });

    $(document).on('click', '[data-remoteAction="create"]', function() {
        app.PadController.create()
        .then(render())
    });

    // Add event for rename pad
    $(document).on('click', '[data-remoteAction="rename"]', function() {
        var name = $('#rename-modal').find('#name').val();
        if(name == "") return;
        app.PadController.update(id, name)
        .then(render())
    });

    args = args.map( _ => ({ settings: _ }) )
    console.log(args);

    render();
});
