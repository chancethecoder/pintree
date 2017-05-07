/**
 * Script applied to pad.html.
 */
import { remote } from "electron"

var app = remote.app;
var win = remote.getCurrentWindow()

// Parse args passed from main process
require('electron-window').parseArgs()
var args = window.__args__

// Add contextmenu
const { Menu, MenuItem } = remote
const menu = new Menu()

menu.append(new MenuItem({ label: 'Hide', click() { close() } }))
menu.append(new MenuItem({ label: 'New pad', click() { app.padController.create() } }))
menu.append(new MenuItem({
    label: 'Delete Pad',
    click() {
        /** TODO: show warning dialog */
        app.padController.remove(args['id'])
    }
}))
menu.append(new MenuItem({
    label: 'Quit App',
    click() {
        /** TODO: show warning dialog */
        app.quit()
    }
}))
window.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    menu.popup(remote.getCurrentWindow())
}, false)

// Process to do once after DOM loaded.
document.addEventListener('DOMContentLoaded', function () {

    /**
     * TODO : A page switching in pad root.
     * default page is editor page.
     * Todo list
     * - option settings
     * - revision history
     */


    /** Editor page */

    /**
     * This is settings for Quill editor.
     * Create editor in #editor tag, wrapped in pad root.
     * api-doc: https://quilljs.com/docs/quickstart
     */
    var editor = new Quill('#editor', {
        modules: {
            toolbar: [
                [{ 'font': [] }, { 'size': [] }],
                [{ 'color': [] }, { 'background': [] }],
                [ 'bold', 'italic', 'underline', 'strike' ],
                [{ 'align': [] }, 'code-block'],
                [ 'link', 'image' ],
            ],
            history: {
                delay: 2000,
                maxStack: 500,
                userOnly: true
            }
        },
        theme: 'snow',
    })

    editor.setContents(args['content'])

    // Add event listeners to data-* tags.
    $(document).on('click', '[data-action="backward"]', () => { editor.history.undo() })
    $(document).on('click', '[data-action="forward"]', () => { editor.history.redo() })
    $(document).on('click', '[data-remoteAction="hide"]', () => { close() })
    $(document).on('click', '[data-remoteAction="save"]', () => {

        // Pass delta object to main process with id.
        app.padController.save(args['id'], editor.getContents())
        .then( result => {
            /**
             * TODO : Add Growl / Notify to show dialogs
             */
            console.log(result)
        })
        .catch( err => {
            console.log(err)
        })
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
    var resize = function( type ) {
        let h = $editor.height() + (type == 'show' ? 100 : -100)
        $editor.height(h)
    }
    var editMode = function(){
        $icon.removeClass('fa-pencil-square')
          .addClass('fa-floppy-o')
          .attr('data-remoteAction', 'save')
        editor.enable()
        resize('hide')
    }
    var moveMode = function(){
        $icon.removeClass('fa-floppy-o')
          .addClass('fa-pencil-square')
          .attr('data-remoteAction', null)
        editor.disable()
        resize('show')
    }

    $toolbar.first()
    .on('hide.bs.collapse', () => { moveMode() })
    .on('show.bs.collapse', () => { editMode() })

    // Set editor mode
    if( args['isFirst'] ){
        editMode()
    }
    else{
        moveMode()
    }

})
