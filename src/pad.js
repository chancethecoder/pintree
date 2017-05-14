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

    // Text change event handling
    // The only case is not saved state.
    editor.on('text-change', function(delta, oldDelta, source){
        if (source == 'api') {
            console.log("An API call triggered this change.");
        } else if (source == 'user') {
            console.log("A user action triggered this change.");
        }

        let $state = $('#editor-state')
        $state.find('span')
            .removeClass('saved')
            .addClass('modified')
        $state.find('label').text('modified')
    })

    // Add event listeners to data-* tags.
    $(document).on('click', '[data-action="backward"]', () => { editor.history.undo() })
    $(document).on('click', '[data-action="forward"]', () => { editor.history.redo() })
    $(document).on('click', '[data-remoteAction="hide"]', () => { close() })
    $(document).on('click', '[data-remoteAction="save"]', () => {

        let $state = $('#editor-state')
        $state.find('span')
            .removeClass('modified')
            .addClass('onSave')
        $state.find('label').text('saving...')

        // Pass delta object to main process with id.
        app.padController.save(args['id'], editor.getContents())
        .then( result => {
            /**
             * TODO : Add Growl / Notify to show dialogs
             */
            console.log(result)

            let $state = $('#editor-state')
            $state.find('span')
                .removeClass('onSave')
                .addClass('saved')
            $state.find('label').text('saved')
        })
        .catch( err => {
            console.log(err)
        })
    })


    /**
     * At first, editor should be opened with saved option.
     * Each functions will trigger modification of options.
     */

    var $toolbar = $('.ql-toolbar')
    var $editor = $('#editor')
    var $icon = $('.collapse-button-wrapper i')
    var $moveLayer = $('.move-layer')

    var editMode = function() {
        $icon.removeClass('fa-pencil-square')
          .addClass('fa-floppy-o')
          .attr('data-remoteAction', 'save')
        editor.enable()
    }
    var moveMode = function() {
        $icon.removeClass('fa-floppy-o')
          .addClass('fa-pencil-square')
          .attr('data-remoteAction', null)
        editor.disable()
    }

    $toolbar.first()
    .on('hide.bs.collapse', () => { moveMode() })
    .on('show.bs.collapse', () => { editMode() })

})
