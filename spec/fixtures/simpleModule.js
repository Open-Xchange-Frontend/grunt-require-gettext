/* ding
 * dong
 */
define('simpleModule', ['gettext!test/mySimpleModule'], function (gt) {
    'use strict';

    console.log('There should be a translated string: ', gt('translate me!'));

    return true;
});
