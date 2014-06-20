/*
 * grunt-require-gettext
 * https://github.com/open-xchange-frontend/grunt-require-gettext
 *
 * Copyright (c) 2014 Julian Bäume
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    var _ = require('lodash');
    var extractStrings = require('../lib/extract')(grunt).extractStrings;

    grunt.registerMultiTask('create_pot', 'Extract calls to gettext that is used with a requirejs gettext module.', function () {
        var PO = require('pofile');
        var options = this.options();

        this.files.forEach(function (file) {
            var poItems;

            poItems = file.src.filter(function (srcFile) {
                return srcFile.substr(-3) === '.js';
            }).map(function (srcFile) {
                return {srcFile: srcFile, items: extractStrings(srcFile)};
            }).reduce(function (acc, result) {
                if (!acc) {
                    return;
                }
                var items = result.items;
                if (!items) {
                    items = [];
                    grunt.log.debug('No strings extracted from file ' + result.srcFile);
                }
                items.forEach(function (item) {
                    var key = item.msgId;
                    if (item.msgContext) {
                        key += '_' + item.msgContext;
                    }
                    if (!acc[key]) {
                        acc[key] = new PO.Item();
                    }
                    var poItem = acc[key];
                    poItem.msgid = item.msgId;
                    poItem.msgid_plural = item.msgIdPlural;
                    poItem.msgctxt = item.msgContext;
                    if (poItem.references.indexOf(item.fileName + ':' + item.line) < 0) {
                        poItem.references.push(item.fileName + ':' + item.line);
                    }
                    if (poItem.references.indexOf('module:' + item.module) < 0) {
                        poItem.references.push('module:' + item.module);
                    }
                    if (poItem.msgid_plural) {
                        //FIXME: may be, this should be handled by pofile library
                        poItem.msgstr = ['', ''];
                    }
                    if (item.comment) {
                        var commentItem = PO.parse('msgid ""\nmsgstr ""\n\n' + item.comment + '\nmsgid "temp"\nmsgstr""\n').items[0];
                        _(poItem.flags).extend(commentItem.flags);
                        poItem.extractedComments = _.uniq([].concat(poItem.extractedComments, commentItem.extractedComments));
                    }
                });
                return acc;
            }, {});


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
