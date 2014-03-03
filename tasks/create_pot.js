/*
 * grunt-require-gettext
 * https://github.com/open-xchange-frontend/grunt-require-gettext
 *
 * Copyright (c) 2014 Julian Bäume
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    var esprima = require('esprima');

    function extractStrings(fileName) {
        function walkTree(node, fn) {
            fn(node);

            for (var key in node) {
                var obj = node[key];
                if (typeof obj === 'object') {
                    walkTree(obj, fn);
                }
            }
        }

        var syntax = esprima.parse(grunt.file.read(fileName), {comment: true, loc: true});
        var items;

        walkTree(syntax, function (node) {
            if (node !== null &&
                node.type === 'CallExpression' &&
                node.callee !== null &&
                node.callee.name === 'define' &&
                node['arguments'] !== null &&
                node['arguments'].length > 2
            ) {
                node['arguments'][1].elements.map(function (el, index) {
                    if (el.value.substr(0, 8) === 'gettext!') {
                        return {
                            name: node['arguments'][2].params[index].name,
                            module: el.value.substr(8)
                        };
                    }
                }).filter(function (arg) {
                    return arg !== undefined;
                }).forEach(function (obj) {
                    var gtName = obj.name;
                    var module = obj.module;

                    if (node['arguments'][2].type === 'FunctionExpression') {
                        walkTree(node['arguments'][2], function (node) {
                            if (node !== null &&
                                node.type === 'CallExpression' &&
                                node.callee !== null &&
                                node.callee.name === gtName &&
                                node['arguments'] !== null &&
                                node['arguments'].length
                            ) {
                                if (!node['arguments'][0].value) {
                                    grunt.log.debug('Could not read node ' + JSON.stringify(node['arguments'][0], null, 4));
                                    grunt.verbose.writeln('Skipping gt call');
                                    return;
                                }
                                items = items || [];
                                items.push({
                                    msgId: node['arguments'][0].value.trim(),
                                    module: module,
                                    fileName: fileName,
                                    line: node.loc.start.line
                                });
                            } else if (
                                node !== null &&
                                node.type === 'CallExpression' &&
                                node.callee !== null &&
                                node.callee.type === 'MemberExpression' &&
                                node.callee.object.name === gtName &&
                                node.callee.property.name === 'pgettext' &&
                                node['arguments'] !== null &&
                                node['arguments'].length === 2
                            ) {
                                if (!node['arguments'][0].value || !node['arguments'][1].value) {
                                    grunt.log.debug('Could not read node ' + JSON.stringify(node['arguments'], null, 4));
                                    grunt.verbose.writeln('Skipping gt.pgettext call');
                                    return;
                                }
                                items = items || [];
                                items.push({
                                    msgId: node['arguments'][1].value.trim(),
                                    msgContext: node['arguments'][0].value.trim(),
                                    module: module,
                                    fileName: fileName,
                                    line: node.loc.start.line
                                });
                            } else if (
                                node !== null &&
                                node.type === 'CallExpression' &&
                                node.callee !== null &&
                                node.callee.type === 'MemberExpression' &&
                                node.callee.object.name === gtName &&
                                node.callee.property.name === 'ngettext' &&
                                node['arguments'] !== null &&
                                node['arguments'].length === 3
                            ) {
                                if (!node['arguments'][0].value || !node['arguments'][1].value || !node['arguments'][2].value) {
                                    grunt.log.debug('Could not read node ' + JSON.stringify(node['arguments'], null, 4));
                                    grunt.verbose.writeln('Skipping gt.ngettext call');
                                    return;
                                }
                                items = items || [];
                                items.push({
                                    msgId: node['arguments'][0].value.trim(),
                                    msgIdPlural: node['arguments'][1].value.trim(),
                                    module: module,
                                    fileName: fileName,
                                    line: node.loc.start.line
                                });
                            }
                        });
                    }
                });
            }
        });
        return items;
    }

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
