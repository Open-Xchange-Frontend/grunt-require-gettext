/* ding
 * dong
 */
define('simpleModule', [
    'randomModule',
    'gettext!test/mySimpleModule',
    'randomModule2',
    'gettext!test/alternativeGTModule'
], function (random, gt, random2, altGT) {
    'use strict';

    console.log('There should be a translated string: ', gt('translate me!'));
    console.log('There should be a translated string with alternative gt module: ', altGT('translate me, too! Alternatively!'));

    console.log(gt('String with \" in it'));

    console.log(gt.pgettext('perform action', 'Empty folder'));
    console.log(gt.pgettext('describe state', 'Empty folder'));
    return true;
});
