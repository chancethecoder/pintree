// This helper restore saved pad instances and make window

import { app } from 'electron';
import jetpack from 'fs-jetpack';
import createPad from './create_pad';
import env from '../env';

export default function () {
    var pads = [];
    var path = app.getPath('userData') + "/" + env.default_pad.path;

    // there is no pad instances
    if(!jetpack.exists(path)) {
        console.log(path + ": there is no pad instances!");
        return;
    }

    // list path's subdirectory
    var subdirs = jetpack.list(path);

    // make instances for each sub directory
    for (let subdir of subdirs) {
        try {
            var dir = jetpack.cwd(path + "/" + subdir);
            var file = dir.find({ matching: ['*.json'] });
            var restoredState = dir.read(file[0], 'json');
            var pad = createPad(restoredState);
            pad.loadURL('file://' + __dirname + '/pad.html');
            pad.once('ready-to-show', () => {
                pad.show()
            });
            pads.push(pad);
            console.log('open:' + subdir);
        } catch (e) {
            console.log('fail:' + subdir);
        };
    }
    return pads;
}
