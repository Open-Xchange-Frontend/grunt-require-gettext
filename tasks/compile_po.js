/*
 * grunt-require-gettext
 * https://github.com/open-xchange-frontend/grunt-require-gettext
 *
 * Copyright (c) 2014 Julian Bäume
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    grunt.registerMultiTask('compile_po', 'Compiles different po files to their corresponding requirejs gettext module.', function () {
        var done = this.async();
        var PO = require('pofile');
        var _ = require('lodash');
        var dest = this.files[0].dest;
        var options = this.options;

        grunt.file.mkdir(dest);
        if (this.files.length > 1 || !grunt.file.isDir(dest)) {
            grunt.fail.fatal('Target (' + dest + ') must be exactly _one_ directory');
            done(false);
        }

        this.files[0].src.filter(function (srcFile) {
            return srcFile.substr(-3) === '.po';
        }).forEach(function (poFile) {
            var fromFile;
            var templateFile = options().template;
            if (templateFile && grunt.file.isFile(templateFile)) {
                fromFile = grunt.file.read(templateFile);
            }
            /* jshint multistr: true */
            var template = fromFile ||
'define("<%= module %>.<%= language %>", [], function () {\n\
    return {\n\
        "module": "<%= module %>",\n\
        "language": "<%= language %>",\n\
        "nplurals": <%= nplurals %>,\n\
        "plural": "<%= plural %>",\n\
        "dictionary": {\n\
<% for (var msgid in dictionary) {%>\
            <%= JSON.stringify(msgid) %>: <%= JSON.stringify(dictionary[msgid]) %>,\n\
<% } %>\
        }\n\
    };\n\
});\n';
            /* jshint multistr: false */
            PO.load(poFile, function (err, po) {
                if (err) {
                    grunt.fail.fatal(err);
                    done(false);
                }
                var modules = {};
                po.items.forEach(function (item) {
                    var module = item.references.filter(function (ref) {
                        return ref.substr(0, 7) === 'module:';
                    })[0];

                    if (!module) {
                        grunt.log.warn('Ignoring item (no module found): ' + item.msgid);
                        grunt.verbose.warn(item);
                        grunt.verbose.warn('in file', poFile);
                        return;
                    }
                    module = module.substr(7);

                    module = module;
                    if (!modules[module]) {
                        modules[module] = [];
                    }
                    modules[module].push(item);
                });
                var mkIdStrMapping = function (acc, poItem) {
                    acc[poItem.msgid] = poItem.msgstr;
                    return acc;
                };

                var parsePluralForms = function (str) {
                    return str.split(';').map(function (val) {
                        var index = val.indexOf('=');
                        return [val.substr(0, index).trim(), val.substr(index + 1).trim()];
                    }).reduce(function (acc, arr) {
                        if (!arr[0] || !arr[1]) {
                            return acc;
                        }
                        acc[arr[0]] = arr[1];
                        return acc;
                    }, {});
                };

                for (var module in modules) {
                    var items = modules[module].reduce(mkIdStrMapping, {});
                    var pluralForms = parsePluralForms(po.headers['Plural-Forms']);
                    var data = {
                        module: module,
                        language: po.headers.Language,
                        nplurals: pluralForms.nplurals,
                        plural: pluralForms.plural,
                        dictionary: items
                    };

                    grunt.file.write(dest + module + '.' + data.language + '.js', _.template(template, data));
                }
                done(true);
            });
        });
    });
};
