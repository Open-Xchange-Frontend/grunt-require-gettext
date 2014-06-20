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
        var extractLib = require('../lib/extract')(grunt);
        var dest = this.files[0].dest;
        var options = this.options;
        var isNotFuzzy = function (poItem) {
            return includeFuzzy || !poItem.flags.fuzzy;
        };
        var isTranslated = function (poItem) {
            return poItem.msgstr.reduce(function (acc, translation) {
                return acc && !!translation;
            }, true);
        };
        var isNotObsolete = function (poItem) {
            return !poItem.obsolete;
        };

        grunt.file.mkdir(dest);
        if (this.files.length > 1 || !grunt.file.isDir(dest)) {
            grunt.fail.fatal('Target (' + dest + ') must be exactly _one_ directory');
            done(false);
        }

        var poFilesCount = this.files[0].src.length;
        var processedPoFiles = 0;
        var includeFuzzy = options().includeFuzzy;
        this.files[0].src.forEach(function (poFile) {
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
                po.items
                .forEach(function (item) {
                    var itemModules = item.references.map(function (ref) {
                        return ref.split(' ');
                    }).reduce(function (acc, ref) {
                        return acc.concat(ref);
                    }, []).filter(function (ref) {
                        return ref.substr(0, 7) === 'module:';
                    });

                    if (itemModules.length === 0) {
                        if (isTranslated(item) && isNotFuzzy(item) && !item.obsolete) {
                            //message will not be filtered by one of the above rules, warn the user!
                            grunt.log.warn('Could not load module information for', item);
                            grunt.log.warn('in file', poFile);
                            grunt.fail.warn('Could not load module information for at least one item.');
                        }
                        grunt.log.debug('Ignoring item (no module found): ' + item.msgid);
                        grunt.log.debug(item);
                        grunt.log.debug('in file', poFile);
                        return;
                    }
                    itemModules.forEach(function (module) {
                        module = module.substr(7);

                        if (!modules[module]) {
                            modules[module] = [];
                        }
                        modules[module].push(item);
                    });
                });
                var mkIdStrMapping = function (acc, poItem) {
                    acc[extractLib.mkKey(poItem)] = poItem.msgstr;
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

                var getLanguageFrom = function (headers) {
                    var lang = headers.Language;
                    var lang_extension = lang + '_' + lang.toUpperCase();
                    var path = require('path');
                    if (lang && lang.indexOf('_') < 0 && path.basename(poFile, '.po').indexOf(lang_extension) >= 0) {
                        lang += '_' + lang.toUpperCase();
                    }
                    if (!lang || lang.indexOf('_') < 0) {
                        lang = path.basename(poFile, '.po');
                        grunt.log.warn('Ambiguous language header provided, falling back to source filename:', lang);
                    }
                    return lang;
                };

                for (var module in modules) {
                    var items = modules[module]
                            .filter(isTranslated)
                            .filter(isNotFuzzy)
                            .filter(isNotObsolete)
                            .reduce(mkIdStrMapping, {});
                    var pluralForms = parsePluralForms(po.headers['Plural-Forms']);
                    var data = {
                        module: module,
                        language: getLanguageFrom(po.headers),
                        nplurals: pluralForms.nplurals,
                        plural: pluralForms.plural,
                        dictionary: items
                    };

                    grunt.file.write(dest + module + '.' + data.language + '.js', _.template(template, data));
                }

                processedPoFiles++;
                if (processedPoFiles === poFilesCount) {
                    done(true);
                }
            });
        });
        if (this.files[0].src.length === 0) {
            done(true);
        }
    });
};
