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

    describe('with missing language header', function () {
        it('should fall back to po filename', function () {
            expect('tmp/build/i18n/test/mySimpleModule.lang_LANG.js').to.be.a.file().and.not.empty;
            expect('tmp/build/i18n/test/alternativeGTModule.lang_LANG.js').to.be.a.file().and.not.empty;
        });
    });
});
