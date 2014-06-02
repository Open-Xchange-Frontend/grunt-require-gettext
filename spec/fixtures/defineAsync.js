/* ding
 * dong
 */
define.async('asyncModule', [
    'randomModule',
    'gettext!test/mySimpleModule',
    'randomModule2'
], function (random, gt, random2, altGT) {
    'use strict';

    console.log(gt('A string from an async module'));

    return $.when();
});
