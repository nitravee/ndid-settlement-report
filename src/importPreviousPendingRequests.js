const fs = require('fs');

function importPreviousPendingRequests(filePath) {
  if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
    return {};
  }

  return JSON.parse(fs.readFileSync(filePath));
}

module.exports = { importPreviousPendingRequests };
