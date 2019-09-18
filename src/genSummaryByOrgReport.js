const _ = require('lodash');
const path = require('path');
const mkpath = require('mkpath');
const Excel = require('exceljs');
const moment = require('moment');
const { getRpPlanOfOrg } = require('./importRpPlans');
const { calculateNdidPrice } = require('./calculateNdidPrice');
const { setOuterBorder, setBorder, setSolidFill } = require('./utils/excelUtil');
const { reportFileName } = require('./utils/pathUtil');
const { logFileCreated } = require('./utils/logUtil');


const DEFAULT_FONT = {
  name: 'Angsana New',
  size: 16,
};

const LAST_COL_INDEX = 7;

const MIDDLE_CENTER_ALIGNMENT = { vertical: 'middle', horizontal: 'center' };
const UNIT_NUM_FMT = '#,##0';
const MONEY_NUM_FMT = '#,##0.00';

function calculateTableItemSummaryInfo(settlementRows = [], options = {}) {
  const { mode = 'BILL_TO', rawTotal: overwrittenRawTotal } = options;

  const unit = settlementRows.length;
  const rawTotal =
    overwrittenRawTotal != null ? overwrittenRawTotal : _.sum(settlementRows.map(row => row.price));
  const total = _.round(rawTotal, 2);
  const vat = _.round(rawTotal * 0.07, 2);
  const wht = _.round(rawTotal * 0.03, 2);
  let netTotal;
  switch (mode) {
    case 'PAY_TO':
      netTotal = total + vat;
      break;
    case 'BILL_TO':
      netTotal = (total + vat) - wht;
      break;

    default:
      throw new Error(`Unsupported mode "${mode}" when calculate table item summary info of summary by org excel`);
  }

  return {
    unit,
    total,
    vat,
    wht,
    netTotal,
  };
}

function calculateTablePayToItemSummaryInfo(settlementRows, options = {}) {
  return calculateTableItemSummaryInfo(settlementRows, Object.assign(options, { mode: 'PAY_TO' }));
}

function calculateTableBillToItemSummaryInfo(settlementRows, options = {}) {
  return calculateTableItemSummaryInfo(settlementRows, Object.assign(options, { mode: 'BILL_TO' }));
}

function writeSummaryTable(sheet, tableHeaderRowIndex, summary) {
  // Pay To Table Header
  const tableHeaderRow = sheet.getRow(tableHeaderRowIndex);
  tableHeaderRow.alignment = MIDDLE_CENTER_ALIGNMENT;
  tableHeaderRow.font = DEFAULT_FONT;
  setBorder(sheet, tableHeaderRowIndex, 1, tableHeaderRowIndex, LAST_COL_INDEX);
  setSolidFill(sheet, tableHeaderRowIndex, 1, tableHeaderRowIndex, LAST_COL_INDEX, 'FFC6E0B4');
  tableHeaderRow.getCell(1).value = 'Member';
  tableHeaderRow.getCell(2).value = 'Description';
  tableHeaderRow.getCell(3).value = 'Unit/Transaction';
  tableHeaderRow.getCell(4).value = 'Total';
  tableHeaderRow.getCell(5).value = 'VAT 7%';
  tableHeaderRow.getCell(6).value = 'WHT 3%';
  tableHeaderRow.getCell(7).value = 'Net Total';

  // Pay To Table Content
  let tableItemRowIndex = tableHeaderRowIndex + 1;
  summary.members.forEach((member) => {
    member.items.forEach((memberItem, idx) => {
      /* eslint-disable no-param-reassign */
      setBorder(sheet, tableItemRowIndex, 1, tableItemRowIndex, LAST_COL_INDEX);
      sheet.getRow(tableItemRowIndex).font = DEFAULT_FONT;

      const {
        description, unit, total, vat, wht, netTotal,
      } = memberItem;

      if (idx === 0) {
        sheet.getCell(tableItemRowIndex, 1).value = member.memberName;
      }
      sheet.getCell(tableItemRowIndex, 2).value = description;
      sheet.getCell(tableItemRowIndex, 3).value = unit;
      sheet.getCell(tableItemRowIndex, 3).alignment = MIDDLE_CENTER_ALIGNMENT;
      sheet.getCell(tableItemRowIndex, 3).numFmt = UNIT_NUM_FMT;
      sheet.getCell(tableItemRowIndex, 4).value = total;
      sheet.getCell(tableItemRowIndex, 4).numFmt = MONEY_NUM_FMT;
      sheet.getCell(tableItemRowIndex, 5).value = vat;
      sheet.getCell(tableItemRowIndex, 4).numFmt = MONEY_NUM_FMT;
      sheet.getCell(tableItemRowIndex, 6).value = wht;
      sheet.getCell(tableItemRowIndex, 6).numFmt = MONEY_NUM_FMT;
      sheet.getCell(tableItemRowIndex, 7).value = netTotal;
      sheet.getCell(tableItemRowIndex, 7).numFmt = MONEY_NUM_FMT;

      tableItemRowIndex += 1;
      /* eslint-enable no-param-reassign */
    });
  });

  const tableTotalRowIndex = tableItemRowIndex;
  const tableTotalRow = sheet.getRow(tableTotalRowIndex);
  tableTotalRow.font = Object.assign({}, DEFAULT_FONT, { bold: true });
  setSolidFill(sheet, tableTotalRowIndex, 1, tableTotalRowIndex, LAST_COL_INDEX, 'FFBFBFBF');
  setBorder(sheet, tableTotalRowIndex, 1, tableTotalRowIndex, LAST_COL_INDEX);
  const tableTotalDescCell = tableTotalRow.getCell(2);
  tableTotalDescCell.value = 'TOTAL';
  tableTotalDescCell.alignment = MIDDLE_CENTER_ALIGNMENT;
  const tableTotalUnitCell = tableTotalRow.getCell(3);
  tableTotalUnitCell.value = summary.total.unit;
  tableTotalUnitCell.alignment = MIDDLE_CENTER_ALIGNMENT;
  tableTotalUnitCell.numFmt = UNIT_NUM_FMT;
  const tableTotalTotalCell = tableTotalRow.getCell(4);
  tableTotalTotalCell.value = summary.total.total;
  tableTotalTotalCell.numFmt = MONEY_NUM_FMT;
  const tableTotalVatCell = tableTotalRow.getCell(5);
  tableTotalVatCell.value = summary.total.vat;
  tableTotalVatCell.numFmt = MONEY_NUM_FMT;
  const tableTotalWhtCell = tableTotalRow.getCell(6);
  tableTotalWhtCell.value = summary.total.wht;
  tableTotalWhtCell.numFmt = MONEY_NUM_FMT;
  const tableTotalNetTotalCell = tableTotalRow.getCell(7);
  tableTotalNetTotalCell.value = summary.total.netTotal;
  tableTotalNetTotalCell.numFmt = MONEY_NUM_FMT;

  return tableTotalRowIndex;
}

async function genXlsxFile(
  memberShortName,
  memberFullName,
  billPeriod,
  blockRange,
  version,
  payToSummary,
  billToSummary,
  outputCsvDirPath,
) {
  const workbook = new Excel.Workbook();
  workbook.creator = 'NDID';
  workbook.lastModifiedBy = 'NDID';
  workbook.created = new Date();
  workbook.modified = workbook.created;
  workbook.properties.date1904 = true;

  const sheetName = memberShortName.length <= 30 ? memberShortName : memberShortName.substr(0, 30);
  const sheet = workbook.addWorksheet(sheetName);
  sheet.properties.defaultRowHeight = 20;

  for (let i = 1; i <= LAST_COL_INDEX; i++) {
    sheet.getColumn(i).width = 20;
  }
  sheet.getColumn(2).width = 40;

  // Title
  sheet.mergeCells(1, 1, 1, LAST_COL_INDEX);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = 'SUMMARY REPORT';
  titleCell.font = DEFAULT_FONT;
  titleCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF8CD05C' },
  };
  titleCell.alignment = MIDDLE_CENTER_ALIGNMENT;

  // Bill Period
  setOuterBorder(sheet, 2, 1, 2, LAST_COL_INDEX);
  const billPeriodLabelCell = sheet.getCell(2, 1);
  billPeriodLabelCell.value = 'Billing Period:';
  billPeriodLabelCell.font = Object.assign({}, DEFAULT_FONT, {
    bold: true,
  });
  const billPeriodValueCell = sheet.getCell(2, 2);
  billPeriodValueCell.value =
    `${moment(billPeriod.start).format('D MMMM YYYY H:mm')} - ${moment(billPeriod.end).format('D MMMM YYYY H:mm')}`;
  billPeriodValueCell.font = DEFAULT_FONT;

  // Member Name
  sheet.getRow(3).font = DEFAULT_FONT;
  sheet.getRow(4).font = DEFAULT_FONT;
  sheet.getRow(5).font = DEFAULT_FONT;
  const memberNameLabelCell = sheet.getCell(3, 1);
  memberNameLabelCell.value = 'Member Name:';
  const memberNameValueCell = sheet.getCell(3, 2);
  memberNameValueCell.value = memberFullName;
  setOuterBorder(sheet, 3, 1, 5, 2);

  // Send to
  const sendToLabelCell = sheet.getCell(3, 3);
  sendToLabelCell.value = 'Send To:';
  setOuterBorder(sheet, 3, 3, 5, LAST_COL_INDEX);

  // Pay To Sect Header
  const payToSectHeaderRowIndex = 6;
  sheet.mergeCells(payToSectHeaderRowIndex, 1, payToSectHeaderRowIndex, LAST_COL_INDEX);
  const payToSectHeaderCell = sheet.getCell(payToSectHeaderRowIndex, 1);
  payToSectHeaderCell.value = 'Pay To:';
  payToSectHeaderCell.font = Object.assign({}, DEFAULT_FONT, { bold: true });
  payToSectHeaderCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  payToSectHeaderCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC000' },
  };

  // Pay To Table
  const lastPayToTableRowIndex =
    writeSummaryTable(sheet, payToSectHeaderRowIndex + 1, payToSummary);

  // Bill To Sect Header
  const bilToSectHeaderRowIndex = lastPayToTableRowIndex + 1;
  sheet.mergeCells(bilToSectHeaderRowIndex, 1, bilToSectHeaderRowIndex, LAST_COL_INDEX);
  const billToSectHeaderCell = sheet.getCell(bilToSectHeaderRowIndex, 1);
  billToSectHeaderCell.value = 'Bill To:';
  billToSectHeaderCell.font = Object.assign({}, DEFAULT_FONT, { bold: true });
  billToSectHeaderCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  billToSectHeaderCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC000' },
  };

  // Bill To Table
  writeSummaryTable(sheet, bilToSectHeaderRowIndex + 1, billToSummary);

  const folderPath = path.join(outputCsvDirPath, memberShortName, 'summary-by-org');
  mkpath.sync(folderPath);
  const fileNameWithExt = reportFileName({
    billPeriodStart: billPeriod.start,
    billPeriodEnd: billPeriod.end,
    minBlockHeight: blockRange.min,
    maxBlockHeight: blockRange.max,
    version,
    reportIdentifier: memberShortName,
    extension: 'xlsx',
  });
  const filePath = path.join(folderPath, fileNameWithExt);
  try {
    await workbook.xlsx.writeFile(filePath);
    logFileCreated(fileNameWithExt, folderPath);
  } catch (err) {
    console.error(`ERROR: Failed to write csv/${memberShortName}/summary-by-org/${memberShortName}.xlsx.`, err);
  }
}

async function genSummaryByOrgReport(
  allRows,
  orgList,
  collapsedOrgInfo,
  rpPlans,
  rpPlanDetails,
  billPeriod,
  blockRange,
  version,
  shouldCalculateNdidFee,
  outputCsvDirPath,
) {
  const orgShortNames = _.uniq([...orgList.rpList, ...orgList.idpList, ...orgList.asList]);
  for (const orgShortName of orgShortNames) {
    const orgFullName = collapsedOrgInfo[orgShortName]
      && collapsedOrgInfo[orgShortName].fullName.en;

    // Pay To
    const rpIdpRows = _.groupBy(
      allRows.rpIdp.filter(row =>
        row.rp_org_short_name === orgShortName),
      row => row.idp_org_short_name,
    );
    const rpAsRows = _.groupBy(
      allRows.rpAs.filter(row =>
        row.rp_org_short_name === orgShortName),
      row => row.as_org_short_name,
    );

    const payToOrgShortNames = _.uniq([...Object.keys(rpIdpRows), ...Object.keys(rpAsRows)]);
    const payToSummary = {
      members: [
        ...payToOrgShortNames
          .map((payeeOrgShortName) => {
            const items = [];
            const payeeOrgFullName = collapsedOrgInfo[payeeOrgShortName]
              && collapsedOrgInfo[payeeOrgShortName].fullName.en;
            if (rpIdpRows[payeeOrgShortName]) {
              items.push({
                description: `${payeeOrgFullName} IdP`,
                ...calculateTablePayToItemSummaryInfo(rpIdpRows[payeeOrgShortName]),
              });
            }

            if (rpAsRows[payeeOrgShortName]) {
              items.push({
                description: `${payeeOrgFullName} AS`,
                ...calculateTablePayToItemSummaryInfo(rpAsRows[payeeOrgShortName]),
              });
            }

            return {
              memberName: payeeOrgFullName,
              items,
            };
          }),
      ],
    };

    if (shouldCalculateNdidFee) {
      const ndidRows = allRows.rpNdid.filter(row =>
        row.rp_org_short_name === orgShortName);
      const rpNumOfStamps = _.sum(ndidRows.map(row => row.numberOfStamps));
      const rpPlan = getRpPlanOfOrg(rpPlans, rpPlanDetails, orgShortName, blockRange.min);

      payToSummary.members = [
        {
          memberName: 'NDID',
          items: [{
            description: 'NDID Fee',
            ...calculateTablePayToItemSummaryInfo(
              ndidRows,
              { rawTotal: calculateNdidPrice(rpPlan, rpNumOfStamps) },
            ),
          }],
        },
        ...payToSummary.members,
      ];
    }

    payToSummary.total = {
      unit: _.sumBy(_
        .flatten(payToSummary.members.map(member => member.items)).map(item => item.unit)),
      total: _.sumBy(_
        .flatten(payToSummary.members.map(member => member.items)).map(item => item.total)),
      vat: _.sumBy(_
        .flatten(payToSummary.members.map(member => member.items)).map(item => item.vat)),
      wht: _.sumBy(_
        .flatten(payToSummary.members.map(member => member.items)).map(item => item.wht)),
      netTotal: _.sumBy(_
        .flatten(payToSummary.members.map(member => member.items)).map(item => item.netTotal)),
    };

    // Bill To
    const idpRpRows = _.groupBy(
      allRows.rpIdp.filter(row =>
        row.idp_org_short_name === orgShortName),
      row => row.rp_org_short_name,
    );
    const asRpRows = _.groupBy(
      allRows.rpAs.filter(row =>
        row.as_org_short_name === orgShortName),
      row => row.rp_org_short_name,
    );

    const billToOrgShortNames = _.uniq([...Object.keys(idpRpRows), ...Object.keys(asRpRows)]);
    const billToSummary = {
      members: billToOrgShortNames
        .map((payerOrgShortName) => {
          const items = [];
          const payerOrgFullName = collapsedOrgInfo[payerOrgShortName]
              && collapsedOrgInfo[payerOrgShortName].fullName.en;
          if (idpRpRows[payerOrgShortName]) {
            items.push({
              description: `${payerOrgFullName} IdP`,
              ...calculateTableBillToItemSummaryInfo(idpRpRows[payerOrgShortName]),
            });
          }

          if (asRpRows[payerOrgShortName]) {
            items.push({
              description: `${payerOrgFullName} AS`,
              ...calculateTableBillToItemSummaryInfo(asRpRows[payerOrgShortName]),
            });
          }

          return {
            memberName: payerOrgFullName,
            items,
          };
        }),
    };
    billToSummary.total = {
      unit: _.sumBy(_
        .flatten(billToSummary.members.map(member => member.items)).map(item => item.unit)),
      total: _.sumBy(_
        .flatten(billToSummary.members.map(member => member.items)).map(item => item.total)),
      vat: _.sumBy(_
        .flatten(billToSummary.members.map(member => member.items)).map(item => item.vat)),
      wht: _.sumBy(_
        .flatten(billToSummary.members.map(member => member.items)).map(item => item.wht)),
      netTotal: _.sumBy(_
        .flatten(billToSummary.members.map(member => member.items)).map(item => item.netTotal)),
    };

    await genXlsxFile(
      orgShortName,
      orgFullName,
      billPeriod,
      blockRange,
      version,
      payToSummary,
      billToSummary,
      outputCsvDirPath,
    );
  }
}

module.exports = { genSummaryByOrgReport };
