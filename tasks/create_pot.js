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
    var _ = require('lodash');

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
        function isBetweenTokens(comment, prevToken, token) {
            return comment.range[0] >= prevToken.range[1] && comment.range[1] <= token.range[0];
        }

        function getComment(ast, node) {
            var tokenIndex;
            var currentIndex, min = 0, max = ast.tokens.length;
            while (tokenIndex === undefined) {
                currentIndex = Math.floor((min + max) / 2);
                if (ast.tokens[currentIndex].loc.start.line < node.loc.start.line) {
                    min = currentIndex;
                    continue;
                } else if (ast.tokens[currentIndex].loc.start.line > node.loc.start.line) {
                    max = currentIndex;
                    continue;
                } else if (ast.tokens[currentIndex].loc.start.column < node.loc.start.column) {
                    min = currentIndex;
                    continue;
                } else if (ast.tokens[currentIndex].loc.start.column > node.loc.start.column) {
                    max = currentIndex;
                    continue;
                }
                tokenIndex = currentIndex;
            }
            while (ast.tokens[currentIndex].loc.start.line === node.loc.start.line) {
                //use currentIndex variable to get the first index in a line
                currentIndex--;
            }

            var commentObj = ast.comments.filter(function (comment) {
                var commentBeforeToken = isBetweenTokens(comment, ast.tokens[tokenIndex - 1], ast.tokens[tokenIndex]);
                var commentInLinesAbove = isBetweenTokens(comment, ast.tokens[currentIndex], ast.tokens[currentIndex + 1]);

                return (commentBeforeToken || commentInLinesAbove);
            }).map(function (commentInRange) {
                return commentInRange.value;
            }).join('\n');

            return commentObj;
        }

        function tryEval(code) {
            var val;
            try {
                val = eval(code);
            } catch (e) {
                grunt.verbose.warn(e + ' - while statically evaluating code: ' + code);
            }
            return val;
        }

        var code = grunt.file.read(fileName);
        var syntax = esprima.parse(code, {comment: true, loc: true, tokens: true, range: true});
        var items;
        var handleGtCall = function (node, gtName, module) {
            if (node !== null &&
                node.type === 'CallExpression' &&
                node.callee !== null &&
                node.callee.name === gtName &&
                node['arguments'] !== null &&
                node['arguments'].length
            ) {
                var msgId = node['arguments'][0].value || tryEval(code.slice(node['arguments'][0].range[0], node['arguments'][0].range[1]));
                if (!msgId) {
                    if (getComment(syntax, node).indexOf('#, dynamic') >= 0) {
                        grunt.verbose.warn('Ignoring gt.pgettext call with dynamic flag set.');
                        return;
                    }
                    grunt.verbose.warn(JSON.stringify(node['arguments'], null, 4));
                    grunt.log.error('Override this by adding a "dynamic" flag to the translator comments');
                    grunt.fail.warn('Could not read node in file: ' + fileName + ' use --verbose for more info');
                    return;
                }
                items = items || [];
                items.push({
                    msgId: msgId.trim(),
                    module: module,
                    fileName: fileName,
                    line: node.loc.start.line,
                    comment: getComment(syntax, node)
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
                var msgId = node['arguments'][1].value || tryEval(code.slice(node['arguments'][1].range[0], node['arguments'][1].range[1]));
                var msgContext = node['arguments'][0].value || tryEval(code.slice(node['arguments'][0].range[0], node['arguments'][0].range[1]));
                if (!msgId || !msgContext) {
                    if (getComment(syntax, node).indexOf('#, dynamic') >= 0) {
                        grunt.verbose.warn('Ignoring gt.pgettext call with dynamic flag set.');
                        return;
                    }
                    grunt.verbose.warn(JSON.stringify(node['arguments'], null, 4));
                    grunt.log.error('Override this by adding a "dynamic" flag to the translator comments');
                    grunt.fail.warn('Could not read node in file: ' + fileName + ' use --verbose for more info');
                    return;
                }
                items = items || [];
                items.push({
                    msgId: msgId.trim(),
                    msgContext: msgContext.trim(),
                    module: module,
                    fileName: fileName,
                    line: node.loc.start.line,
                    comment: getComment(syntax, node)
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
                var msgId = node['arguments'][0].value || tryEval(code.slice(node['arguments'][0].range[0], node['arguments'][0].range[1]));
                var msgIdPlural = node['arguments'][1].value || tryEval(code.slice(node['arguments'][1].range[0], node['arguments'][1].range[1]));
                if (!msgId || !msgIdPlural || !node['arguments'][2]) {
                    if (getComment(syntax, node).indexOf('#, dynamic') >= 0) {
                        grunt.verbose.warn('Ignoring gt.pgettext call with dynamic flag set.');
                        return;
                    }
                    grunt.verbose.warn(JSON.stringify(node['arguments'], null, 4));
                    grunt.log.error('Override this by adding a "dynamic" flag to the translator comments');
                    grunt.fail.warn('Could not read node  in file: ' + fileName + ' use --verbose for more info');
                    return;
                }
                items = items || [];
                items.push({
                    msgId: msgId.trim(),
                    msgIdPlural: msgIdPlural.trim(),
                    module: module,
                    fileName: fileName,
                    line: node.loc.start.line,
                    comment: getComment(syntax, node)
                });
            } else if (
                node !== null &&
                node.type === 'CallExpression' &&
                node.callee !== null &&
                node.callee.type === 'MemberExpression' &&
                node.callee.object.name === gtName &&
                node.callee.property.name === 'npgettext' &&
                node['arguments'] !== null &&
                node['arguments'].length === 4
            ) {
                var msgContext = node['arguments'][0].value || tryEval(code.slice(node['arguments'][0].range[0], node['arguments'][0].range[1]));
                var msgId = node['arguments'][1].value || tryEval(code.slice(node['arguments'][1].range[0], node['arguments'][1].range[1]));
                var msgIdPlural = node['arguments'][2].value || tryEval(code.slice(node['arguments'][2].range[0], node['arguments'][2].range[1]));
                if (!msgContext || !msgId || !msgIdPlural || !node['arguments'][3]) {
                    if (getComment(syntax, node).indexOf('#, dynamic') >= 0) {
                        grunt.verbose.warn('Ignoring gt.pgettext call with dynamic flag set.');
                        return;
                    }
                    grunt.verbose.warn(JSON.stringify(node['arguments'], null, 4));
                    grunt.log.error('Override this by adding a "dynamic" flag to the translator comments');
                    grunt.fail.warn('Could not read node in file: ' + fileName + ' use --verbose for more info');
                    return;
                }
                items = items || [];
                items.push({
                    msgContext: msgContext.trim(),
                    msgId: msgId.trim(),
                    msgIdPlural: msgIdPlural.trim(),
                    module: module,
                    fileName: fileName,
                    line: node.loc.start.line,
                    comment: getComment(syntax, node)
                });
            }
        };

        walkTree(syntax, function (node) {
            if (node !== null &&
                node.type === 'CallExpression' &&
                node.callee !== null &&
                node.callee.name === 'define' &&
                node['arguments'] !== null &&
                node['arguments'].length > 2)
            {
                node['arguments'][1].elements.map(function (el, index) {
                    if (el.value.substr(0, 8) === 'gettext!') {
                        var param = node['arguments'][2].params[index];
                        if (!param) {
                            grunt.log.warn('Unused require-gettext module call in', fileName);
                            return;
                        }
                        return {
                            name: param.name,
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
                            handleGtCall(node, gtName, module);
                        });
                    }
                });
            } else if (node !== null &&
                node.type === 'CallExpression' &&
                node.callee !== null &&
                node.callee.type === 'MemberExpression' &&
                node.callee.object !== null &&
                node.callee.object.name === 'define' &&
                node.callee.property.name === 'async' &&
                node['arguments'] !== null &&
                node['arguments'].length > 2)
            {
                node['arguments'][1].elements.map(function (el, index) {
                    if (el.value.substr(0, 8) === 'gettext!') {
                        var param = node['arguments'][2].params[index];
                        if (!param) {
                            grunt.log.warn('Unused require-gettext module call in', fileName);
                            return;
                        }
                        return {
                            name: param.name,
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
                            handleGtCall(node, gtName, module);
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
