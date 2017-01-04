// This is overall custom javascript.
// apply to all of html pages

import { remote } from 'electron';

var app = remote.app;

document.addEventListener('DOMContentLoaded', function () {

    $('[data-toggle="tooltip"]').tooltip();
});
