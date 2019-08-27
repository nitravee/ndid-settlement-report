const moment = require('moment');
const { join } = require('path');
const fs = require('fs');
const { getDirectories } = require('./utils/pathUtil');
const { getMonthYearDependentConfig, compareMonthYear } = require('./utils/configUtil');


const RP_PLAN_TYPE = {
  PER_STAMP: 'perStamp',
  PREPAID: 'prepaid',
};

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

    const dirPath = join(planDirPath, minMonthYear.year.toString(), minMonthYear.month.toString());
    const rpPlans = JSON.parse(fs.readFileSync(join(dirPath, 'rpPlans.json'), 'utf8'));
    const planDetail = JSON.parse(fs.readFileSync(join(dirPath, 'planDetail.json'), 'utf8'));

    // Validate if RP plans aligns with plan detail
    Object.values(rpPlans).forEach((planName) => {
      if (!planDetail[planName]) {
        throw new Error(`Unsupported RP plan (${planName}) in ${join(dirPath, 'rpPlans.json')}`);
      }
    });

    Object.keys(planDetail).forEach((planName) => {
      planDetail[planName].name = planName;
    });

    result.push({
      min_month_year: minMonthYear,
      max_month_year: maxMonthYear,
      rp_plans: rpPlans,
      plan_detail: planDetail,
      default_plan: Object.keys(planDetail).find(planName => planDetail[planName].default),
    });
  }

  return result;
}

function getRpPlanOfOrg(rpPlans, org, monthYear) {
  const scopedPlans = getMonthYearDependentConfig(rpPlans, monthYear);
  const planName = scopedPlans.rp_plans[org] || scopedPlans.default_plan;
  return scopedPlans.plan_detail[planName];
}

module.exports = {
  importRpPlans, getRpPlanOfOrg, RP_PLAN_TYPE,
};
