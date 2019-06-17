const moment = require('moment');
const { join } = require('path');
const fs = require('fs');
const { getDirectories } = require('./utils/pathUtil');


const RP_PLAN = {
  PLAN_1: 'Plan 1',
  PLAN_2: {
    S: 'Plan 2-S',
    M: 'Plan 2-M',
    L: 'Plan 2-L',
  },
};
const DEFAULT_RP_PLAN = RP_PLAN.PLAN_1;

function compareMonthYear(a, b) {
  if (a.year < b.year) { return -1; }
  if (a.year > b.year) { return 1; }
  return a.month - b.month;
}

function importRpPlans(planDirPath) {
  const yearDirPaths = getDirectories(planDirPath);
  const years = yearDirPaths
    .map(dirPath => parseInt(dirPath.substring(dirPath.lastIndexOf('/') + 1), 10))
    .sort((a, b) => a - b);

  const monthYears = [];
  const result = [];
  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const yearDirPath = join(planDirPath, year.toString());

    const monthDirPaths = getDirectories(yearDirPath);
    const months = monthDirPaths
      .map(dirPath => parseInt(dirPath.substring(dirPath.lastIndexOf('/') + 1), 10))
      .sort((a, b) => a - b);

    for (let j = 0; j < months.length; j++) {
      const month = months[j];
      monthYears.push({
        year,
        month,
      });
    }
  }

  monthYears.sort(compareMonthYear);

  for (let i = 0; i < monthYears.length; i++) {
    const minMonthYear = monthYears[i];
    let maxMonthYear;
    if (monthYears[i + 1]) {
      const maxMonthYearMoment = moment(`${monthYears[i + 1].month}-${monthYears[i + 1].year}`, 'M-YYYY').subtract(1, 'months');
      maxMonthYear = {
        year: maxMonthYearMoment.year(),
        month: maxMonthYearMoment.month() + 1,
      };
    }

    const dirPath = join(planDirPath, minMonthYear.year.toString(), minMonthYear.month.toString(), 'rpPlans.json');
    const rpPlans = JSON.parse(fs.readFileSync(dirPath, 'utf8'));

    result.push({
      min_month_year: minMonthYear,
      max_month_year: maxMonthYear,
      rp_plans: rpPlans,
    });
  }

  return result;
}

function getRpPlanOfOrg(rpPlans, org, monthYear) {
  const scopedPlans = rpPlans
    .filter((item) => {
      if (item.max_month_year == null) {
        // NOTE: monthYear >= item.min_month_year
        return compareMonthYear(monthYear, item.min_month_year) >= 0;
      }
      // NOTE: monthYear >= item.min_month_year && monthYear <= item.max_month_year
      return compareMonthYear(monthYear, item.min_month_year) >= 0
        && compareMonthYear(monthYear, item.max_month_year) <= 0;
    })[0].rp_plans || {};

  return scopedPlans[org] || DEFAULT_RP_PLAN;
}

module.exports = {
  importRpPlans, getRpPlanOfOrg, compareMonthYear, RP_PLAN, DEFAULT_RP_PLAN,
};
