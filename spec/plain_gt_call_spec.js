'use strict';

var PO = require('pofile');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(require('chai-things'));

describe('extract_gt_strings', function () {
    describe('should extract plain gt calls', function () {
        it('from simple example file', function (done) {
            expect('tmp/i18n/simple.pot').to.be.a.file().and.not.empty;
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                //msgid extracted
                expect(po.items).to.contain.a.thing.with.property('msgid', 'translate me!');

                var item = po.items.filter(function (item) {
                    return item.msgid === 'translate me!';
                })[0];
                //file and line number extracted
                expect(item.references).to.contain('spec/fixtures/simpleModule.js:7');
                //module name extracted
                expect(item.references).to.contain('module:test/mySimpleModule');
                expect(err).to.equal(null);
                done();
            });
        });
    });
});
