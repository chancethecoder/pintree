// This is pad.html custom javascript.
import { remote } from "electron";
import PouchDB from 'pouchdb';

require('electron-window').parseArgs()

var app = remote.app,
    win = remote.getCurrentWindow(),
    args = window.__args__,
    db = new PouchDB('db')

var toolbarOptions = [
    [{ 'font': [] }, { 'size': [] }],
    [{ 'color': [] }, { 'background': [] }],
    [ 'bold', 'italic', 'underline', 'strike' ],
    [{ 'align': [] }, 'code-block'],
    [ 'link', 'image' ],
];

// Save pad window's state to database
function save() {
    // Load state
    db.get(args._id).then(function (doc) {
        // Update current state
        return db.put({
            _id: doc._id,
            _rev: doc._rev,
            name: doc.name,
            content: doc.content,
            state: app.PadController.getState(args._id)
        })
    }).then(function () {
        // Remove Callback function to quit window
        window.onbeforeunload = () => { }
    }).then(function () {
        app.PadController.destroy(args._id);   // destroy window
        window.close();                 // close window
    })
    .catch(function (err) {
        console.log(err);
        console.log('backoff...');
        setTimeout(function() {
            save();
        }, 2000);
    })
    // Prevent close window event
    return false;
}

window.onbeforeunload = save();

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

    // Add event for creating new pad
    $(document).on('click', '[data-remoteAction="save"]', function() {
        var delta = editor.getContents();

        db.get(args._id).then(function (doc) {
            // Update current state
            return db.put({
                _id: doc._id,
                _rev: doc._rev,
                content: doc.content,
            })
        })
        .catch(function (err) {
            console.log(err);
        })
    })

    // Add event for closing new pad
    $(document).on('click', '[data-remoteAction="hide"]', function() {
        $('[data-remoteAction="save"]').trigger('click')
        close();
    })

    // Add event for deleting new pad
    $(document).on('click', '[data-remoteAction="remove"]', function() {
        // app.PadController.remove(args['id']);
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
    var resize = function( type ){
        var [ width, height ] = win.getSize()
        var dh = (type == 'show') ? 100 : -100
        win.setSize(width, height + dh)
        /*
        var easing = (type == 'show') ? t*t : -(t*t)
        win.setSize(width, Math.round(win.getSize()[1] + easing*15))
        if( t > 0 ) setTimeout(() => resize(type, t-0.05), 30)
        */
    }
    var editMode = function(){
        $icon.removeClass('fa-pencil-square')
          .addClass('fa-floppy-o')
          .attr('data-remoteAction', 'save')
        editor.enable()
        //$moveLayer.hide()
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
    if( args['isFirst'] ){
        $toolbar.addClass('collapse in')
        editMode()
    }
    else{
        $toolbar.addClass('collapse')
        moveMode()
    }

})
