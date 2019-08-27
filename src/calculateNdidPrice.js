const { RP_PLAN_TYPE } = require('./importRpPlans');

function calculateNdidPrice(planDetail, numberOfStamps) {
  const { steps } = planDetail;

  let remainStamps = numberOfStamps;
  let price = 0;
  for (const step of steps) {
    if (remainStamps <= 0) {
      break;
    }

    const { type, numberOfStamps: stepStamps } = step;
    const isUnlimited = stepStamps <= 0;
    let stampCount = remainStamps <= stepStamps ? remainStamps : stepStamps;
    if (isUnlimited) {
      stampCount = remainStamps;
    }

    switch (type) {
      case RP_PLAN_TYPE.PER_STAMP:
        price += step.perStampRate * stampCount;
        break;
      case RP_PLAN_TYPE.PREPAID:
        price += step.price;
        break;

      default:
        throw new Error(`Unsupported RP plan type - ${type}`);
    }

    remainStamps = isUnlimited ? 0 : (remainStamps - stepStamps);
  }

  return price;
}

module.exports = { calculateNdidPrice };
