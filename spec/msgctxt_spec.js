'use strict';

var PO = require('pofile');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(require('chai-things'));

describe('extract strings', function () {
    function findAllStrings(str, items) {
        return items.filter(function (item) {
            return item.msgid === str;
        });
    }
    describe('should extract message context', function () {
        it('from simple example file', function (done) {
            expect('tmp/i18n/simple.pot').to.be.a.file().and.not.empty;
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                //msgid extracted
                expect(po.items).to.contain.a.thing.with.property('msgid', 'Empty folder');

                var items = findAllStrings('Empty folder', po.items);
                expect(items).to.contain.a.thing.with.property('msgctxt', 'perform action');
                expect(items).to.contain.a.thing.with.property('msgctxt', 'describe state');

                expect(err).to.equal(null);
                done();
            });
        });
    });
    describe('should extract plural forms', function () {
        it('from simple example file', function (done) {
            expect('tmp/i18n/simple.pot').to.be.a.file().and.not.empty;
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                //msgid extracted
                expect(po.items).to.contain.a.thing.with.property('msgid', 'Box contains %1$d item');

                var items = findAllStrings('Box contains %1$d item', po.items);
                expect(items).to.contain.a.thing.with.property('msgid_plural', 'Box contains %1$d items');

                expect(err).to.equal(null);
                done();
            });
        });
    });
});
