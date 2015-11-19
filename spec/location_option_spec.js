'use strict';

var PO = require('pofile');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(require('chai-things'));

describe('Customize extracted location information', function () {
    function findString(str, items) {
        return items.filter(function (item) {
            return item.msgid === str;
        })[0];
    }

    describe('default ("full") option', function () {
        it('should extract line numbers', function (done) {
            PO.load('tmp/i18n/simple.pot', function (err, po) {
                var item = findString('Welcome, %1$s %2$s!', po.items);
                expect(/:\d+$/.test(item.references[0]), 'contains line numbers').to.equal(true);
                expect(err).to.equal(null);
                done();
            });
        });
    });

    describe('"file" option', function () {
        it('should not extract line numbers', function (done) {
            PO.load('tmp/i18n/simple_file_location.pot', function (err, po) {
                var item = findString('Welcome, %1$s %2$s!', po.items);
                expect(/:\d+$/.test(item.references[0]), 'contains line numbers').to.equal(false);
                expect(err).to.equal(null);
                done();
            });
        });
    });

    describe('"none" option', function () {
        it('should not extract line numbers', function (done) {
            PO.load('tmp/i18n/simple_no_location.pot', function (err, po) {
                var item = findString('Welcome, %1$s %2$s!', po.items);
                var references = item.references.filter(function (ref) {
                    return !/^module:/.test(ref);
                });
                expect(references.length, 'references contains modules only').to.equal(0);
                expect(err).to.equal(null);
                done();
            });
        });
    });
});