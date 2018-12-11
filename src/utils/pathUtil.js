const moment = require('moment');


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

module.exports = {
  reportExecRoundDirName,
  reportFileName,
};
