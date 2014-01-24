'use strict';

var PO = require('pofile');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(require('chai-things'));

describe('extract strings', function () {
    describe('should extract plain gt calls', function () {
        function findString(str, items) {
            return items.filter(function (item) {
                return item.msgid === str;
            })[0];
        }
        it('from simple example file', function (done) {
            expect('tmp/i18n/simple.pot').to.be.a.file().and.not.empty;
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                //msgid extracted
                expect(po.items).to.contain.a.thing.with.property('msgid', 'translate me!');

                var item = findString('translate me!', po.items);
                //file and line number extracted
                expect(item.references).to.contain('spec/fixtures/simpleModule.js:12');
                //module name extracted
                expect(item.references).to.contain('module:test/mySimpleModule');
                expect(err).to.equal(null);
                done();
            });
        });
        it('should respect multiple gettext modules of require', function (done) {
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                //msgid extracted
                expect(po.items).to.contain.a.thing.with.property('msgid', 'translate me!');

                var item = findString('translate me!', po.items);
                //file and line number extracted
                expect(item.references).to.contain('spec/fixtures/simpleModule.js:12');
                //module name extracted
                expect(item.references).to.contain('module:test/mySimpleModule');

                item = findString('translate me, too! Alternatively!', po.items);
                //file and line number extracted
                expect(item.references).to.contain('spec/fixtures/simpleModule.js:13');
                //module name extracted
                expect(item.references).to.contain('module:test/alternativeGTModule');

                expect(err).to.equal(null);
                done();
            });
        });
    });
});
