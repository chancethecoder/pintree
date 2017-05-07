/**
 * Script applied to overall html.
 */
import { remote } from 'electron';

var app = remote.app;

// Process to do once after DOM loaded.
document.addEventListener('DOMContentLoaded', function () {

    $('[data-toggle="tooltip"]').tooltip();
});
