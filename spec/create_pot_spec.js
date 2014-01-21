'use strict';

var PO = require('pofile');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));
chai.use(require('chai-things'));

describe('create_pot task', function () {
    it('should support a custom header via option', function (done) {
        expect('tmp/i18n/simple.pot').to.be.a.file();
        PO.load('tmp/i18n/simple.pot', function (err, potFile) {
            expect(err).to.equal(null);
            expect(potFile.headers['PO-Revision-Date']).to.equal('DATE');
            done();
        });
    });
    it('should set a default header if no headers option is set', function (done) {
        expect('tmp/i18n/simple_no_headers.pot').to.be.a.file();
        PO.load('tmp/i18n/simple_no_headers.pot', function (err, potFile) {
            expect(err).to.equal(null);
            expect(potFile.headers['PO-Revision-Date']).not.to.equal('DATE');
            expect(potFile.headers['Content-Type']).to.equal('text/plain; charset=UTF-8');
            done();
        });
    });
});
