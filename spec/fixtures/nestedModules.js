define('nestedGTModules', ['gettext!test/gtModuleOuter'], function (gt) {
    require(['gettext!test/gtModuleInner'], function (gt) {
        console.log(gt('translating with test/gtModuleInner'));
    });

    console.log(gt('translating with test/gtModuleOuter'));
});
