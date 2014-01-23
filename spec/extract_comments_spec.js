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
    });
});
