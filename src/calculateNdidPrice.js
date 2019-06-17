const { RP_PLAN } = require('./importRpPlans');

function calculatePlan1NdidPrice(numberOfStamps) {
  let price = 0;
  if (numberOfStamps <= 300000) {
    price += numberOfStamps * 3;
    return price;
  }
  price += 300000 * 3;

  if (numberOfStamps <= 600000) {
    price += (numberOfStamps - 300000) * 2.75;
    return price;
  }
  price += 300000 * 2.75;

  if (numberOfStamps <= 900000) {
    price += (numberOfStamps - 600000) * 2.5;
    return price;
  }
  price += 300000 * 2.5;
  price += (numberOfStamps - 900000) * 2;

  return price;
}

function calculatePlan2SNdidPrice(numberOfStamps) {
  let price = 1500000;
  if (numberOfStamps > 1000000) {
    price += (numberOfStamps - 1000000) * 2;
  }
  return price;
}

function calculatePlan2MNdidPrice(numberOfStamps) {
  let price = 2100000;
  if (numberOfStamps > 1500000) {
    price += (numberOfStamps - 1500000) * 2;
  }
  return price;
}

function calculatePlan2LNdidPrice() {
  return 2700000;
}

function calculateNdidPrice(rpPlan, numberOfStamps) {
  switch (rpPlan) {
    case RP_PLAN.PLAN_1:
      return calculatePlan1NdidPrice(numberOfStamps);
    case RP_PLAN.PLAN_2.S:
      return calculatePlan2SNdidPrice(numberOfStamps);
    case RP_PLAN.PLAN_2.M:
      return calculatePlan2MNdidPrice(numberOfStamps);
    case RP_PLAN.PLAN_2.L:
      return calculatePlan2LNdidPrice();
    default:
      console.error('Unsupported RP plan', rpPlan);
  }
  return undefined;
}

module.exports = { calculateNdidPrice };
