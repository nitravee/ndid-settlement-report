const fs = require('fs');

function importPreviousPendingRequests(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(filePath));
}

module.exports = { importPreviousPendingRequests };
