'use strict';

var PO = require('pofile');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(require('chai-things'));

describe('extract strings', function () {
    describe('from fuzzy JavaScript modules', function () {
        function findString(str, items) {
            return items.filter(function (item) {
                return item.msgid === str;
            })[0];
        }

        var po;

        beforeEach(function (done) {
            expect('tmp/i18n/simple.pot').to.be.a.file().and.not.empty;
            PO.load('tmp/i18n/simple.pot', function (err, content) {
                expect(err).to.equal(null);
                po = content;
                done();
            });
        });

        it('from fuzzy example file', function () {
            //msgid extracted
            expect(po.items).to.contain.a.thing.with.property('msgid', 'A string from a fuzzy module');
        });
        it('should escape linebreaks', function () {
            expect(po.items).to.contain.a.thing.with.property('msgid', 'A string with\n \\n in it');
        });
        it('should find string within gt.format call', function () {
            //msgid extracted
            expect(po.items).to.contain.a.thing.with.property('msgid', '%1$d Minute');

            var item = findString('%1$d Minute', po.items);
            expect(item.msgid_plural).to.equal('%1$d Minutes');
        });

        describe('should extract statically concatenated strings', function () {
            it('(plain gt call)', function () {
                expect(po.items).to.contain.a.thing.with.property('msgid', 'A custom concatenated string to support multiple lines');
            });
            it('(gt.pgettext call)', function () {
                var item = findString('concat pgettext', po.items);
                expect(item).to.have.a.property('msgid', 'concat pgettext');
                expect(item).to.have.a.property('msgctxt', 'my context');
            });
            it('(gt.ngettext call)', function () {
                expect(po.items).to.contain.a.thing.with.property('msgid', '%1$d thing');
            });
            it('(gt.npgettext call)', function () {
                var item = findString('with %1$d thing', po.items);
                expect(item).to.have.a.property('msgid', 'with %1$d thing');
                expect(item).to.have.a.property('msgctxt', 'my context');
            });
        });
    });
});
