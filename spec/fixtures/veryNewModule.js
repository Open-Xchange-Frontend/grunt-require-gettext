/* ding
 * dong
 */
define('veryNewModule', [
    'gettext!test/mySimpleModule'
], function (gt) {
    'use strict';

    console.log(gt('String without a module reference'));

    console.log(gt('Completely new string, missing in po'));

    return true;
});
