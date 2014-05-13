'use strict';

var extract = {
    comments: require('./lib/comments.js'),
    require_gettext: require('./lib/require_gettext.js')
};

module.exports = {
    util: require('./lib/util.js'),
    extract: extract
};
