/*
 * grunt-require-gettext
 * https://github.com/open-xchange-frontend/grunt-require-gettext
 *
 * Copyright (c) 2014 Julian Bäume
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    grunt.registerMultiTask('create_pot', 'Extract calls to gettext that is used with a requirejs gettext module.', function () {
        var PO = require('pofile');
        var extract = require('../lib/extract')(grunt);
        var options = this.options();

        this.files.forEach(function (file) {
            var poItems;

            try {
                poItems = extract.fromFiles(file.src.filter(function (srcFile) {
                    return srcFile.substr(-3) === '.js';
                }), { location: options.location });
            } catch (e) {
                grunt.fail.fatal(e);
            }

            if (poItems) {
                var catalog = new PO();
                for (var key in poItems) {
                    catalog.items.push(poItems[key]);
                }
                if (options.headers) {
                    grunt.verbose.writeln('Writing custom headers: ' + JSON.stringify(options.headers, null, 4));
                }
                catalog.headers = options.headers || {
                    'Content-Type': 'text/plain; charset=UTF-8',
                    'Content-Transfer-Encoding': '8bit'
                };
                grunt.file.write(file.dest, catalog.toString());
            }
        });
    });
};
