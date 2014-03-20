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
        it('from fuzzy example file', function (done) {
            expect('tmp/i18n/simple.pot').to.be.a.file().and.not.empty;
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                //msgid extracted
                expect(po.items).to.contain.a.thing.with.property('msgid', 'A string from a fuzzy module');

                expect(err).to.equal(null);
                done();
            });
        });
        it('should find string within gt.format call', function (done) {
            expect('tmp/i18n/simple.pot').to.be.a.file().and.not.empty;
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                //msgid extracted
                expect(po.items).to.contain.a.thing.with.property('msgid', '%1$d Minute');

                var item = findString('%1$d Minute', po.items);
                expect(item.msgid_plural).to.equal('%1$d Minutes');
                expect(err).to.equal(null);
                done();
            });
        });
    });
});
