'use strict';

var util = {
    walkTree: function walkTree(node, fn) {
        fn(node);

        for (var key in node) {
            var obj = node[key];
            if (typeof obj === 'object') {
                walkTree(obj, fn);
            }
        }
    }
};

module.exports = util;
