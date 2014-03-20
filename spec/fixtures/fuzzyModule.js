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
    console.log(gt.format(gt.ngettext('%1$d Minute', '%1$d Minutes', item.value), gt.noI18n(item.value)));
    return {}
});
