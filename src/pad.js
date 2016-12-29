// This is pad.html custom javascript.
import { remote } from "electron"

require('electron-window').parseArgs()

var app = remote.app;
var win = remote.getCurrentWindow()

var args = window.__args__

var toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],

    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction

    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean']                                         // remove formatting button
];

document.addEventListener('DOMContentLoaded', function () {

    // Create quill editor
    var editor = new Quill('#editor', {
        modules: {
            toolbar: toolbarOptions,
            history: {
                delay: 2000,
                maxStack: 500,
                userOnly: true
            }
        },
        theme: 'snow'
    })

    editor.setContents(args['content']);

    // Add event for editor actions
    $(document).on('click', '[data-action="backward"]', () => { editor.history.undo() })
    $(document).on('click', '[data-action="forward"]', () => { editor.history.redo() })
    $(document).on('click', '[data-action="erase"]', () => { editor.setText('') })

    // Add event for creating new pad
    $(document).on('click', '[data-remoteAction="save"]', function() {
        var delta = editor.getContents();
        app.PadController.save(args['id'], delta);
    })

    // Add event for creating new pad
    $(document).on('click', '[data-remoteAction="remove"]', function() {
    })


    // init
    var $toolbar = $('.ql-toolbar')
    var $editor = $('#editor')
    var $icon = $('.collapse-button-wrapper i')
    var $moveLayer = $('#move-layer')

    // Resize event handler
    $editor.css('height', win.getSize()[1])
    $(window).on('resize', function() {
        $editor.css('height', win.getSize()[1])
    })

    // Press collapse button
    var resize = function( type, t = 1 ){
        var [ width, height ] = win.getSize()
        var easing = (type == 'show') ? t*t : -(t*t)
        win.setSize(width, Math.round(win.getSize()[1] + easing*15))
        if( t > 0 ) setTimeout(() => resize(type, t-0.05), 13)
    }

    $toolbar.addClass('collapse in')
    // Move mode
    $toolbar.first().on('hide.bs.collapse', function () {
        resize('hide')
        $icon.addClass('fa-pencil-square').removeClass('fa-floppy-o')
        editor.disable()
        $moveLayer.show()
    })
    // Edit mode
    .on('show.bs.collapse', function () {
        resize('show')
        $icon.removeClass('fa-pencil-square').addClass('fa-floppy-o')
        editor.enable()
        $moveLayer.hide()
    })

})
