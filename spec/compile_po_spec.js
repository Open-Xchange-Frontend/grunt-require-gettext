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
    describe('using a simple example', function () {
        it('should generate a loadable requirejs module', function (done) {
            expect('tmp/build/i18n/test/mySimpleModule.de_DE.js').to.be.a.file().and.not.empty;
            expect('tmp/build/i18n/test/alternativeGTModule.de_DE.js').to.be.a.file().and.not.empty;
            requirejs(
                ['test/mySimpleModule.de_DE',
                'test/alternativeGTModule.de_DE'], function (mySimpleModule, alternativeGTModule) {
                    expect(mySimpleModule.language).to.equal('de_DE');
                    expect(alternativeGTModule.language).to.equal('de_DE');
                    done();
                }
            );
        });
    });
});
