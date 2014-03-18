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
        describe('with missing translation', function () {
            it('should be filtered from dictionary', function (done) {
                var translation = JSON.parse(grunt.file.read('tmp/build/i18n/custom/test/mySimpleModule.de_DE.js'));
                expect(translation).not.to.have.ownProperty('part of computer\x00Drive contains %1$d item\x01Drive contains %1$d items');
                done();
            });
        });
        describe('items with no context', function () {
            it('should render keys with singular form only', function (done) {
                var translation = JSON.parse(grunt.file.read('tmp/build/i18n/custom/test/mySimpleModule.de_DE.js'));
                expect('tmp/build/i18n/custom/test/mySimpleModule.de_DE.js').to.be.a.file().and.not.empty;
                expect(translation['translate me!'][0]).to.equal('übersetze mich!');
                done();
            });
            it('should render keys with singular and plural forms', function (done) {
                var translation = JSON.parse(grunt.file.read('tmp/build/i18n/custom/test/mySimpleModule.de_DE.js'));
                expect('tmp/build/i18n/custom/test/mySimpleModule.de_DE.js').to.be.a.file().and.not.empty;
                expect(translation['Box contains %1$d item\x01Box contains %1$d items'][0]).to.equal('Box enthält %1$d Elemente');
                expect(translation['Box contains %1$d item\x01Box contains %1$d items'][1]).to.equal('Box enthält %1$d Elemente');
                done();
            });
        });
        describe('items with context', function () {
            it('should render keys with singular form only', function (done) {
                var translation = JSON.parse(grunt.file.read('tmp/build/i18n/custom/test/mySimpleModule.de_DE.js'));
                expect('tmp/build/i18n/custom/test/mySimpleModule.de_DE.js').to.be.a.file().and.not.empty;
                expect(translation['describe state\x00Empty folder'][0]).to.equal('Leerer Ordner');
                expect(translation['perform action\x00Empty folder'][0]).to.equal('Leere Ordner');
                done();
            });
            it('should render keys with singular and plural forms', function (done) {
                var translation = JSON.parse(grunt.file.read('tmp/build/i18n/custom/test/mySimpleModule.de_DE.js'));
                expect('tmp/build/i18n/custom/test/mySimpleModule.de_DE.js').to.be.a.file().and.not.empty;
                expect(translation['Box contains %1$d item\u0001Box contains %1$d items'][0]).to.equal('Box enthält %1$d Elemente');
                expect(translation['Box contains %1$d item\u0001Box contains %1$d items'][1]).to.equal('Box enthält %1$d Elemente');
                done();
            });
        });
        describe('messages with fuzzy flag', function () {
            it('should be filtered from catalog by default', function () {
                var translation = JSON.parse(grunt.file.read('tmp/build/i18n/custom/test/mySimpleModule.de_DE.js'));
                expect('tmp/build/i18n/custom/test/mySimpleModule.de_DE.js').to.be.a.file().and.not.empty;
                expect(translation).not.to.have.property('A message with fuzzy translation').that.is.an('array');
            });

            //TODO: implement this
            it('should be included in catalog if includeFuzzy option is set', function () {
                var translation = JSON.parse(grunt.file.read('tmp/build/i18n/includeFuzzy/test/mySimpleModule.de_DE.js'));
                expect(translation).to.have.property('A message with fuzzy translation').that.is.an('array');
            });
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
