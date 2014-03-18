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
    console.log(altGT('String with \" in it'));

    //#. empty is meant as an action (make folder empty!)
    console.log(gt.pgettext('perform action', 'Empty folder'));
    //#. empty is meant as a state (folder is empty)
    console.log(gt.pgettext('describe state', 'Empty folder'));

    //#. %1$d is the number of items in the box
    //#, c-format
    console.log(gt.ngettext('Box contains %1$d item', 'Box contains %1$d items', 4));

    //#. %1$d is the number of items in the drive
    //#. Drive is meant to be a product name, here
    //#, c-format
    console.log(gt.npgettext('product name', 'Drive contains %1$d item', 'Drive contains %1$d items', 23));
    //#. %1$d is the number of items in the drive
    //#. Drive is meant to be a part of a computer, here (as in HDD)
    //#, c-format
    console.log(gt.npgettext('part of computer', 'Drive contains %1$d item', 'Drive contains %1$d items', 42));

    console.log(
        //#. %1$s is the given name
        //#. %2$s is the family name
        //#, c-format
        gt('Welcome, %1$s %2$s!', firstName, lastName)
    );

    console.log(gt('A message with fuzzy translation'));
    return true;
});
