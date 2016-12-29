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
    var $moveLayer = $('.move-layer')

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
    var editMode = function(){
        $icon.removeClass('fa-pencil-square')
          .addClass('fa-floppy-o')
          .attr('data-remoteAction', 'save')
        editor.enable()
        $moveLayer.hide()
    }
    var moveMode = function(){
        $icon.removeClass('fa-floppy-o')
          .addClass('fa-pencil-square')
          .attr('data-remoteAction', null)
        editor.disable()
        $moveLayer.show()
    }

    $toolbar.first().on('hide.bs.collapse', function () {
        moveMode()
        resize('hide')
    })
    .on('show.bs.collapse', function () {
        editMode()
        resize('show')
    })

    // Set editor mode
    if( args['create'] ){
        $toolbar.addClass('collapse in')
        editMode()
    }
    else{
        $toolbar.addClass('collapse')
        moveMode()
    }

})
