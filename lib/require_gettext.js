'use strict';

var walkTree = require('./util.js').walkTree;
var getComment = require('./comments').getComment;

var noop = function () {};
var grunt = {
    log: {
        debug: noop,
        warn: noop
    },
    verbose: {
        writeln: noop
    }
};

function tryEval(code) {
    var val;
    try {
        val = eval(code);
    } catch (e) {
        grunt.verbose.warn(e + ' - while statically evaluating code: ' + code);
    }
    return val;
}

var Extractor = function RequireGettextExtractor(ast, code) {
    var items = [];
    var fileName = ast.fileName;
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
                if (getComment(ast, node).indexOf('#, dynamic') >= 0) {
                    grunt.verbose.warn('Ignoring gt.pgettext call with dynamic flag set.');
                    return;
                }
                grunt.verbose.warn(JSON.stringify(node['arguments'], null, 4));
                grunt.log.error('Override this by adding a "dynamic" flag to the translator comments');
                grunt.fail.warn('Could not read node in file: ' + fileName + ' use --verbose for more info');
                return;
            }
            items.push({
                msgId: msgId.trim(),
                module: module,
                fileName: fileName,
                line: node.loc.start.line,
                comment: getComment(ast, node)
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
                if (getComment(ast, node).indexOf('#, dynamic') >= 0) {
                    grunt.verbose.warn('Ignoring gt.pgettext call with dynamic flag set.');
                    return;
                }
                grunt.verbose.warn(JSON.stringify(node['arguments'], null, 4));
                grunt.log.error('Override this by adding a "dynamic" flag to the translator comments');
                grunt.fail.warn('Could not read node in file: ' + fileName + ' use --verbose for more info');
                return;
            }
            items.push({
                msgId: msgId.trim(),
                msgContext: msgContext.trim(),
                module: module,
                fileName: fileName,
                line: node.loc.start.line,
                comment: getComment(ast, node)
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
                if (getComment(ast, node).indexOf('#, dynamic') >= 0) {
                    grunt.verbose.warn('Ignoring gt.pgettext call with dynamic flag set.');
                    return;
                }
                grunt.verbose.warn(JSON.stringify(node['arguments'], null, 4));
                grunt.log.error('Override this by adding a "dynamic" flag to the translator comments');
                grunt.fail.warn('Could not read node  in file: ' + fileName + ' use --verbose for more info');
                return;
            }
            items.push({
                msgId: msgId.trim(),
                msgIdPlural: msgIdPlural.trim(),
                module: module,
                fileName: fileName,
                line: node.loc.start.line,
                comment: getComment(ast, node)
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
                if (getComment(ast, node).indexOf('#, dynamic') >= 0) {
                    grunt.verbose.warn('Ignoring gt.pgettext call with dynamic flag set.');
                    return;
                }
                grunt.verbose.warn(JSON.stringify(node['arguments'], null, 4));
                grunt.log.error('Override this by adding a "dynamic" flag to the translator comments');
                grunt.fail.warn('Could not read node in file: ' + fileName + ' use --verbose for more info');
                return;
            }
            items.push({
                msgContext: msgContext.trim(),
                msgId: msgId.trim(),
                msgIdPlural: msgIdPlural.trim(),
                module: module,
                fileName: fileName,
                line: node.loc.start.line,
                comment: getComment(ast, node)
            });
        }
    };

    walkTree(ast, function (node) {
        if (node !== null &&
            node.type === 'CallExpression' &&
            node.callee !== null &&
            (node.callee.name === 'define' ||
            (node.callee.type === 'MemberExpression' &&
            node.callee.object !== null &&
            node.callee.object.name === 'define' &&
            node.callee.property.name === 'async')) &&
            node['arguments'] !== null &&
            node['arguments'].length > 2
        ) {
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

    this.allPoItems = function () {
        return items;
    };
};

module.exports = Extractor;
