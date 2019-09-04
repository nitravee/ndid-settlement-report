const { RP_PLAN_TYPE } = require('./importRpPlans');

function calculateNdidPrice(planDetail, numberOfStamps) {
  const { steps } = planDetail;

  let remainStamps = numberOfStamps;
  let price = 0;
  for (const step of steps) {
    const { type, numberOfStamps: stepStamps } = step;
    const isUnlimited = stepStamps <= 0;

    if (type === RP_PLAN_TYPE.PER_STAMP) {
      if (remainStamps <= 0) {
        break;
      }

      let stampCount = remainStamps <= stepStamps ? remainStamps : stepStamps;
      if (isUnlimited) {
        stampCount = remainStamps;
      }
      price += step.perStampRate * stampCount;
    } else if (type === RP_PLAN_TYPE.PREPAID) {
      price += step.price;
    } else {
      throw new Error(`Unsupported RP plan type - ${type}`);
    }

    remainStamps = isUnlimited ? 0 : (remainStamps - stepStamps);
  }

  return price;
}

module.exports = { calculateNdidPrice };
