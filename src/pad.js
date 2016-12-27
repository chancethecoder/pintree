// This is pad.html custom javascript.
import { remote } from "electron";

var app = remote.app;

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
    });

    // Add event for creating new pad
    $('[data-target="delete-pad"]').on('click', function() {
        // delete pad
        app.deletePad();
    });
});
