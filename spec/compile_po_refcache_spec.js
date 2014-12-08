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
    describe('which is empty', function () {
        it('should generate module files with empty dictionary', function (done) {
            expect('tmp/build/i18n/test/mySimpleModule.foo_BAR.js').to.be.a.file().and.not.empty;
            requirejs(
                ['test/mySimpleModule.foo_BAR'], function (simple) {
                    expect(simple.dictionary).to.exist.and.be.empty;
                    done();
                }
            );
        });
    });
    describe('using reference cache', function () {
        it('should extract string with module reference missing in po file', function (done) {
            requirejs(
                ['test/mySimpleModule.de_DE'], function (simple) {
                    var dict = simple.dictionary;
                    expect(dict['String without a module reference']).to.exist;
                    done();
                }
            );
        });
        it('should handle/ignore strings without reference that are not in cache', function (done) {
            requirejs(
                ['test/mySimpleModule.de_DE'], function (simple) {
                    var dict = simple.dictionary;
                    expect(dict['String (no refs) still in po but removed from sources']).not.to.exist;
                    done();
                }
            );
        });
        it('should not contain new untranslated strings', function (done) {
            requirejs(
                ['test/mySimpleModule.de_DE'], function (simple) {
                    var dict = simple.dictionary;
                    expect(dict['Completely new string, missing in po']).not.to.exist;
                    done();
                }
            );
        });
    });
});
