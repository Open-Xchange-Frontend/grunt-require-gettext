/* ding
 * dong
 */
define('fuzzyModule', [
    'randomModule',
    'gettext!test/mySimpleModule',
    'randomModule2',
    'gettext!test/alternativeGTModule',
    'gettext!test/unusedGTModule'
], function (random, gt, random2, altGT) {
    'use strict';

    console.log(gt('A string from a fuzzy module'));
    return {}
});
