'use strict';

var lib = require('../lib/extract')({
    file: {
        read: require('fs').readFileSync
    },
    log: {
        warn: function () {}
    },
    verbose: {
        warn: function () {}
    }
});
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(require('chai-things'));

describe('extract strings', function () {
    describe('from broken files', function () {

        it('should throw exception when gt is used before gt.ngettext', function () {
            expect(function () {
                lib.fromFiles(['spec/fixtures/broken/context_collision.js']);
            }).to.throw(/Do you really want to delete this item\?/);
        });

        it('should throw exception when gt is used after gt.ngettext', function () {
            expect(function () {
                lib.fromFiles(['spec/fixtures/broken/context_collision2.js']);
            }).to.throw(/Do you really want to delete this item\?/);
        });
    });
});
