'use strict';

var PO = require('pofile');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(require('chai-things'));

describe('extract strings', function () {
    describe('from asynchronuously defined JavaScript modules', function () {
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

        it('from simple example file', function () {
            //msgid extracted
            expect(po.items).to.contain.a.thing.with.property('msgid', 'A string from an async module');
        });
    });
});
