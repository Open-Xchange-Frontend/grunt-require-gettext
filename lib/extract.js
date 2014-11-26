'use strict';

module.exports = function (grunt) {
    var esprima = require('esprima');
    var getComment = require('./comments').getComment;

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
                    grunt.verbose.error('Override this by adding a "dynamic" flag to the translator comments');
                    grunt.fail.warn('Could not read node in file: ' + fileName + ' use --verbose for more info');
                    return;
                }
                items = items || [];
                items.push({
                    msgid: msgId.trim(),
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
                    msgid: msgId.trim(),
                    msgctxt: msgContext.trim(),
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
                    msgid: msgId.trim(),
                    msgid_plural: msgIdPlural.trim(),
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
                    msgctxt: msgContext.trim(),
                    msgid: msgId.trim(),
                    msgid_plural: msgIdPlural.trim(),
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
                (node.callee.name === 'define' ||
                (node.callee.type === 'MemberExpression' &&
                node.callee.object !== null &&
                node.callee.object.name === 'define' &&
                node.callee.property.name === 'async')) &&
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

    function mkKey(poItem) {
        var key = poItem.msgctxt ? poItem.msgctxt + '\x00' + poItem.msgid : poItem.msgid;
        if (poItem.msgid_plural) {
            key += '\x01' + poItem.msgid_plural;
        }
        return key;
    }

    function MissingContextException(poItem, collidingPoItem) {
        this.poItem = poItem;
        this.collidingPoItem = collidingPoItem;
        this.toString = function () {
            return [
                'Usage of singular and plural form of "',
                poItem.msgid,
                '" in the same context: ',
                (collidingPoItem.msgctxt || '[no context]'),
                '\n\nReferences:\n',
                poItem.references.join(', '),
                '\n',
                collidingPoItem.references.join(', '),
                '\n\nChange the context of at least one of the strings (pgettext) or use ngettext/npgettext in both cases.'
            ].join('');
        };
    }

    function fromFiles(files) {
        var PO = require('pofile');
        var _ = require('lodash');
        var catalog = files.map(function (srcFile) {
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
                var key = mkKey(item);
                if (!acc[key]) {
                    acc[key] = new PO.Item();
                }
                var poItem = acc[key];
                poItem.msgid = item.msgid;
                poItem.msgid_plural = item.msgid_plural;
                poItem.msgctxt = item.msgctxt;
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
        for (var key in catalog) {
            //key without msgid_plural part
            var index = key.indexOf('\x01');
            var shortKey = index < 0 ? key : key.slice(0, index);
            if (shortKey !== key && catalog[shortKey]) {
                throw new MissingContextException(catalog[key], catalog[shortKey]);
            }
        }
        return catalog;
    }

    return {
        extractStrings: extractStrings,
        fromFiles: fromFiles,
        mkKey: mkKey
    };
};
