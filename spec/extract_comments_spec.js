'use strict';

var PO = require('pofile');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(require('chai-things'));

describe('extract comments above translated strings', function () {
    describe('should extract gettext flags', function () {
        function findString(str, items) {
            return items.filter(function (item) {
                return item.msgid === str;
            })[0];
        }
        it('from simple example file', function (done) {
            expect('tmp/i18n/simple.pot').to.be.a.file().and.not.empty;
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                //msgid extracted
                expect(po.items).to.contain.a.thing.with.property('msgid', 'Welcome, %1$s %2$s!');

                var item = findString('Welcome, %1$s %2$s!', po.items);
                //flags extracted
                expect(item.flags['c-format']).to.equal(true);
                expect(err).to.equal(null);
                done();
            });
        });
        it('should extract plain comments for translators (plain gt call)', function (done) {
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                //msgid extracted
                expect(po.items).to.contain.a.thing.with.property('msgid', 'Welcome, %1$s %2$s!');

                var item = findString('Welcome, %1$s %2$s!', po.items);
                //comments extracted
                expect(item.extractedComments).to.contain('%1$s is the given name');
                expect(item.extractedComments).to.contain('%2$s is the family name');

                expect(err).to.equal(null);
                done();
            });
        });
        it('should extract plain comments for translators (gt.pgettext call)', function (done) {
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                //msgid extracted
                expect(po.items).to.contain.a.thing.with.property('msgid', 'Empty folder');

                var item = findString('Empty folder', po.items);
                //comments extracted
                expect(item.extractedComments).to.contain('empty is meant as an action (make folder empty!)');

                expect(err).to.equal(null);
                done();
            });
        });
        it('should extract plain comments for translators (gt.ngettext call)', function (done) {
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                //msgid extracted
                expect(po.items).to.contain.a.thing.with.property('msgid', 'Box contains %1$d item');

                var item = findString('Box contains %1$d item', po.items);
                //comments extracted
                expect(item.extractedComments).to.contain('%1$d is the number of items in the box');

                expect(err).to.equal(null);
                done();
            });
        });
        it('should extract plain comments for translators (gt.npgettext call)', function (done) {
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                //msgid extracted
                expect(po.items).to.contain.a.thing.with.property('msgid', 'Drive contains %1$d item');

                var item = findString('Drive contains %1$d item', po.items);
                //comments extracted
                expect(item.extractedComments).to.contain('Drive is meant to be a product name, here');

                expect(err).to.equal(null);
                done();
            });
        });
        it('should extract comments in the same line as the gt call', function (done) {
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                var item = findString('B', po.items);
                expect(item.extractedComments).to.contain('Bytes');
                expect(item.extractedComments).to.contain('another gt comment for Bytes');

                var item = findString('GB', po.items);
                expect(item.extractedComments).to.contain('Gigabytes');
                expect(item.extractedComments).not.to.contain('Megabytes');

                var item = findString('YB', po.items);
                expect(item.extractedComments).to.contain('Yottabytes');
                done();
            });
        });
    });
});
