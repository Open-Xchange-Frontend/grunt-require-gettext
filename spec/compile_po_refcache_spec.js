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
