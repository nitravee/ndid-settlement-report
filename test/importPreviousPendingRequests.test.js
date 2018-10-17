const chai = require('chai');
const path = require('path');
const { importPreviousPendingRequests } = require('../src/importPreviousPendingRequests');
const expectedSuccess = require('../test-data/importPreviousPendingRequests/expectedSuccess');

const { expect } = chai;

function importPreviousPendingRequestsBehaviors() {
  it('should return empty object', () => {
    expect(importPreviousPendingRequests('/notExist.json')).to.be.deep.equal({});
  });
  it('should import successfully', () => {
    expect(importPreviousPendingRequests(path.resolve(__dirname, '../test-data/importPreviousPendingRequests/success.json'))).to.be.deep.equal(expectedSuccess);
  });
}

// Start Describe
describe('importPreviousPendingRequests', importPreviousPendingRequestsBehaviors);
