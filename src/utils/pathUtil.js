const moment = require('moment');
const path = require('path');
const fs = require('fs');


function formattedDatetime(date) {
  return moment(date).format('YYYYMMDDHHmmss');
}

function reportExecRoundDirName({
  billPeriodStart,
  billPeriodEnd,
  minBlockHeight,
  maxBlockHeight,
  version,
  execDatetime,
}) {
  const billStartStr = formattedDatetime(billPeriodStart);
  const billEndStr = formattedDatetime(billPeriodEnd);
  const execDatetimeStr = formattedDatetime(execDatetime);

  return `${billStartStr}_${billEndStr}_${minBlockHeight}_${maxBlockHeight}_${version}_${execDatetimeStr}`;
}

function reportFileName({
  billPeriodStart,
  billPeriodEnd,
  minBlockHeight,
  maxBlockHeight,
  version,
  reportIdentifier,
  rowCount,
  extension,
}) {
  const billStartStr = formattedDatetime(billPeriodStart);
  const billEndStr = formattedDatetime(billPeriodEnd);

  return `${billStartStr}_${billEndStr}_${minBlockHeight}_${maxBlockHeight}_${version}_${reportIdentifier}\
${rowCount != null ? `_${rowCount}` : ''}\
${extension ? `.${extension}` : ''}`;
}

function isDirectory(source) {
  return fs.lstatSync(source).isDirectory();
}

function getDirectories(source) {
  return fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);
}

module.exports = {
  reportExecRoundDirName,
  reportFileName,
  isDirectory,
  getDirectories,
};
