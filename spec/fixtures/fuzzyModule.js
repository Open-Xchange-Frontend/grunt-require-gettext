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
    console.log(gt('A string with\n \\n in it'));
    console.log(gt.format(gt.ngettext('%1$d Minute', '%1$d Minutes', item.value), gt.noI18n(item.value)));

    //some strings in front of the gt call (same line)
    //#. another gt comment for Bytes
    var n_size = [/*#. Bytes*/      gt('B'),
                  /*#. Kilobytes*/  gt('KB'),
                  /*#. Megabytes*/  gt('MB'),
                  /*#. Gigabytes*/  gt('GB'),
                  /*#. Terabytes*/  gt('TB'),
                  /*#. Petabytes*/  gt('PB'),
                  /*#. Exabytes*/   gt('EB'),
                  /*#. Zettabytes*/ gt('ZB'),
                  /*#. Yottabytes*/ gt('YB')];

    console.log(gt('A ' + 'custom ' + 'concatenated ' +
                   'string ' + 'to ' + 'support multiple lines'));
    console.log(gt.ngettext('%1$d ' + 'thing', '%1$d ' + 'things', item.value));
    console.log(gt.pgettext('my context', 'concat ' + 'pgettext'));
    console.log(gt.npgettext('my context', 'with %1$d ' + 'thing', 'with %1$d ' + 'things', item.value));

    console.log(
        //#. %1$s is the given name
        //#. %2$s is the family name
        //#, c-format
        gt('Welcome, %1$s %2$s!', firstName, lastName)
    );

    console.log(gt('Attachment'));
    console.log(gt('Attachments'));
    console.log(gt('White-space hurray! '));
    return {}
});
