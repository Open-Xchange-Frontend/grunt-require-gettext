'use strict';

var chai = require('chai');
var grunt = require('grunt');
var requirejs = require('requirejs');
var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(require('chai-things'));

requirejs.config({
    baseUrl: 'tmp/build/i18n/',
    nodeRequire: require
});

describe('compile po file', function () {
    describe('that is completely untranslated', function () {
        it('should render a file with empty catalog', function (done) {
            expect('tmp/build/i18n/test/mySimpleModule.en_US.js').to.be.a.file().and.not.empty;
            expect('tmp/build/i18n/test/alternativeGTModule.en_US.js').to.be.a.file().and.not.empty;
            requirejs(
                ['test/mySimpleModule.en_US',
                'test/alternativeGTModule.en_US'], function (mySimpleModule, alternativeGTModule) {
                    expect(mySimpleModule.dictionary).to.deep.equal({});
                    expect(alternativeGTModule.dictionary).to.deep.equal({});
                    done();
                });
        });
    });

    describe('with ambiguous filename', function () {
        it('should language header as language', function () {
            expect('tmp/build/i18n/test/mySimpleModule.lang_LANG.js').to.be.a.file().and.not.empty;
            expect('tmp/build/i18n/test/alternativeGTModule.lang_LANG.js').to.be.a.file().and.not.empty;
        });
    });

    describe('with abbr. language header', function () {
        it('and unambiguous language header should prefer filename', function () {
            expect('tmp/build/i18n/test/mySimpleModule.fr_FR.js').to.be.a.file().and.not.empty;
            expect('tmp/build/i18n/test/alternativeGTModule.fr_FR.js').to.be.a.file().and.not.empty;
        });

        it('and ambiguous language header should prefer po filename', function () {
            expect('tmp/build/i18n/test/mySimpleModule.fr_CA.js').to.be.a.file().and.not.empty;
            expect('tmp/build/i18n/test/alternativeGTModule.fr_CA.js').to.be.a.file().and.not.empty;
        });
    });
});
