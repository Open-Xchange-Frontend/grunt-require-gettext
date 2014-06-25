/*
 * grunt-require-gettext
 * https://github.com/open-xchange-frontend/grunt-require-gettext
 *
 * Copyright (c) 2014 Julian Bäume
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    var PO = require('pofile');
    var _ = require('lodash');
    var extractLib = require('../lib/extract')(grunt);

    function allJSSources() {
        var targets = _(grunt.config.get('create_pot')).keys();
        return targets.map(function (target) {
            var files = grunt.task.normalizeMultiTaskFiles(grunt.config.get('create_pot.' + target));
            return files[0].src;
        })
        .reduce(function (acc, files) {
            return acc.concat(files);
        }, []);
    }
    function updateCache(cacheDir, cacheFile) {
        var fs = require('fs');
        var path = require('path');
        var cacheMTime = fs.existsSync(path.join(cacheDir, cacheFile)) ? fs.statSync(path.join(cacheDir, cacheFile)).mtime : 0;
        var extractFromFiles = extractLib.fromFiles;
        var headers;

        var cachedItems = {};
        if (grunt.file.exists(path.join(cacheDir, cacheFile))) {
            var po = PO.parse(grunt.file.read(path.join(cacheDir, cacheFile)));
            headers = po.headers;
            po.items.forEach(function (item) {
                cachedItems[extractLib.mkKey(item)] = item;
            });
        }
        var newItems = extractFromFiles(
            allJSSources()
                .map(function (file) {
                    return {
                        name: file,
                        mtime: fs.statSync(file).mtime
                    };
                }).filter(function (file) {
                    return file.mtime > cacheMTime;
                }).map(function (file) {
                    return file.name;
                }));

        if (newItems) {
            var catalog = new PO();
            for (var key in newItems) {
                var item = mergeRefs(newItems[key], cachedItems[key]);
                cachedItems[key] = item;
            }
            for (var key in cachedItems) {
                catalog.items.push(cachedItems[key]);
            }
            catalog.headers = headers || {
                'Content-Type': 'text/plain; charset=UTF-8',
                'Content-Transfer-Encoding': '8bit'
            };
            grunt.file.write(path.join(cacheDir, cacheFile), catalog.toString());
        }
        return cachedItems;
    }

    function mergeRefs(potItem, poItem) {
        if (!potItem && !poItem) {
            grunt.fail.fatal('Can not merge two undefined items');
            return;
        } else if (!potItem) {
            return poItem;
        } else if (!poItem) {
            return potItem;
        }
        function mkRefsObject(acc, fileRef) {
            acc[fileRef.replace(/:[0-9]+$/, '')] = fileRef;
            return acc;
        }

        var potReferences = potItem.references.reduce(mkRefsObject, {});
        poItem.references = poItem.references.filter(function (ref) {
            return !potReferences[ref.replace(/:[0-9]+$/, '')];
        });
        potItem.references.forEach(function (ref) {
            poItem.references.push(ref);
        });
        return poItem;
    }

    grunt.registerMultiTask('compile_po', 'Compiles different po files to their corresponding requirejs gettext module.', function () {
        var done = this.async();
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

        var cacheDir = options().cacheDir || __dirname + '/../.cache/';
        var cacheFile = options().cacheFile || 'cache.pot';
        var cachedItems = updateCache(cacheDir, cacheFile);

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
                    item = mergeRefs(cachedItems[extractLib.mkKey(item)], item);
                    var itemModules = item.references.map(function (ref) {
                        return ref.split(' ');
                    }).reduce(function (acc, ref) {
                        return acc.concat(ref);
                    }, []).filter(function (ref) {
                        return ref.substr(0, 7) === 'module:';
                    });

                    if (itemModules.length === 0) {
                        if (isTranslated(item) &&
                            cachedItems.hasOwnProperty(extractLib.mkKey(item)) &&
                            isNotFuzzy(item) &&
                            !item.obsolete
                        ) {
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
