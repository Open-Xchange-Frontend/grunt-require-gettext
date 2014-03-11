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
        it('should render with custom template', function (done) {
            var translation = JSON.parse(grunt.file.read('tmp/build/i18n/custom/test/mySimpleModule.de_DE.js'));
            expect('tmp/build/i18n/custom/test/mySimpleModule.de_DE.js').to.be.a.file().and.not.empty;
            expect(translation['translate me!'][0]).to.equal('übersetze mich!');
            done();
        });
    });
    describe('with mesages pointing to different modules', function () {
        it('should put message into each referenced module', function (done) {
            expect('tmp/build/i18n/test/mySimpleModule.de_DE.js').to.be.a.file().and.not.empty;
            expect('tmp/build/i18n/test/alternativeGTModule.de_DE.js').to.be.a.file().and.not.empty;
            requirejs(
                ['test/mySimpleModule.de_DE',
                'test/alternativeGTModule.de_DE'], function (mySimpleModule, alternativeGTModule) {
                    expect(mySimpleModule.dictionary).to.have.property('String with " in it').that.is.an('array');
                    expect(alternativeGTModule.dictionary).to.have.property('String with " in it').that.is.an('array');
                    done();
                }
            );
        });
    });
});
