'use strict';

var PO = require('pofile');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(require('chai-things'));

describe('when using optional parameters to format a string', function () {
    function findAllStrings(str, items) {
        return items.filter(function (item) {
            return item.msgid === str;
        });
    }

    it('should extract from gt call', function (done) {
        PO.load('tmp/i18n/simple.pot', function (err, po) {
            var items = findAllStrings('gt with 2 optional arguments, %1$s %2$s!', po.items);
            expect(items).to.contain.a.thing.with.property('msgid', 'gt with 2 optional arguments, %1$s %2$s!');
            done(err);
        });
    });
    it('should extract from gt.gettext call', function (done) {
        PO.load('tmp/i18n/simple.pot', function (err, po) {
            var items = findAllStrings('gt.gettext with 2 optional arguments, %1$s %2$s!', po.items);
            expect(items).to.contain.a.thing.with.property('msgid', 'gt.gettext with 2 optional arguments, %1$s %2$s!');
            done(err);
        });
    });
    it('should extract from gt.ngettext call', function (done) {
        PO.load('tmp/i18n/simple.pot', function (err, po) {
            var items = findAllStrings('gt.ngettext with 2 optional arguments, %1$s %2$s!', po.items);
            expect(items).to.contain.a.thing.with.property('msgid_plural', 'plural with 2 arguments, %1$s %2$s!');
            done(err);
        });
    });
    it('should extract from gt.pgettext call', function (done) {
        PO.load('tmp/i18n/simple.pot', function (err, po) {
            var items = findAllStrings('gt.pgettext with 2 optional arguments, %1$s %2$s!', po.items);
            expect(items).to.contain.a.thing.with.property('msgid', 'gt.pgettext with 2 optional arguments, %1$s %2$s!');
            expect(items).to.contain.a.thing.with.property('msgctxt', '');
            done(err);
        });
    });
    it('should extract from gt.npgettext call', function (done) {
        PO.load('tmp/i18n/simple.pot', function (err, po) {
            var items = findAllStrings('gt.npgettext with 2 optional arguments, %1$s %2$s!', po.items);
            expect(items).to.contain.a.thing.with.property('msgid_plural', 'plural with 2 arguments, %1$s %2$s!');
            expect(items).to.contain.a.thing.with.property('msgctxt', '');
            done(err);
        });
    });
});
