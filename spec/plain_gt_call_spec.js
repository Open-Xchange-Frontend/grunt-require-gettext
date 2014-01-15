'use strict';

var PO = require('pofile');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(require('chai-things'));

describe('extract_gt_strings', function () {
    function findString(str, items) {
        return items.filter(function (item) {
            return item.msgid === str;
        })[0];
    }

    describe('should extract plain gt calls', function () {
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

    describe('should extract nested gt calls', function () {
        it('from more advanced example file');/*, function (done) {
            expect('tmp/i18n/nested.pot').to.be.a.file().and.not.empty;
            PO.load('tmp/i18n/nested.pot', function (err, po) {
                expect(err).to.equal(null);

                var item = findString('translating with test/gtModuleOuter', po.items);
                //file and line number extracted
                expect(item.references).to.contain('spec/fixtures/nestedModule.js:6');
                //module name extracted
                expect(item.references).to.contain('module:test/gtModuleOuter');

                item = findString('translating with test/gtModuleInner', po.items);
                //file and line number extracted
                expect(item.references).to.contain('spec/fixtures/nested.js:3');
                //module name extracted
                expect(item.references).to.contain('module:test/gtModuleInner');

                done();
            });
        });*/
    });
});
