const Json2csvParser = require('json2csv').Parser;

const fieldsPending = [
  {
    label: 'RP Node ID',
    value: 'rp_id',
  }, {
    label: 'RP Node Name',
    value: 'rp_name',
  }, {
    label: 'Request ID',
    value: 'request_id',
  }, {
    label: 'Request Status',
    value: 'status',
  }, {
    label: 'Closed',
    value: 'closed',
  }, {
    label: 'Timed out',
    value: 'timed_out',
  }, {
    label: 'Created Block Height',
    value: 'height',
  }, {
    label: 'Mode',
    value: 'mode',
  }, {
    label: 'IdP Node IDs',
    value: 'idp_ids',
  }, {
    label: 'IdP Node Names',
    value: 'idp_names',
  }, {
    label: 'Requested IAL',
    value: 'min_ial',
  }, {
    label: 'Requested AAL',
    value: 'min_aal',
  }, {
    label: 'AS Service ID',
    value: 'service_id',
  }, {
    label: 'AS Node IDs',
    value: 'as_ids',
  }, {
    label: 'AS Node Names',
    value: 'as_names',
  },
];

const fieldsRpIdp = [
  {
    label: 'RP Node ID',
    value: 'rp_id',
  },
  {
    label: 'RP Node Name',
    value: 'rp_name',
  },
  {
    label: 'RP Node Industry Code',
    value: row => row.rp_name_obj.industry_code,
  },
  {
    label: 'RP Node Company Code',
    value: row => row.rp_name_obj.company_code,
  },
  {
    label: 'RP Node Marketing Name TH',
    value: row => row.rp_name_obj.marketing_name_th,
  },
  {
    label: 'RP Node Marketing Name EN',
    value: row => row.rp_name_obj.marketing_name_en,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name TH',
    value: row => row.rp_name_obj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name EN',
    value: row => row.rp_name_obj.proxy_or_subsidiary_name_en,
  },
  {
    label: 'Request ID',
    value: 'request_id',
  }, {
    label: 'Request Status',
    value: 'status',
  }, {
    label: 'Closed',
    value: 'closed',
  }, {
    label: 'Timed out',
    value: 'timed_out',
  }, {
    label: 'Created Block Height',
    value: 'height',
  }, {
    label: 'Mode',
    value: 'mode',
  }, {
    label: 'IdP Node ID',
    value: 'idp_id',
  }, {
    label: 'IdP Node Name',
    value: 'idp_name',
  }, {
    label: 'IdP Node Industry Code',
    value: row => row.idp_name_obj.industry_code,
  },
  {
    label: 'IdP Node Company Code',
    value: row => row.idp_name_obj.company_code,
  },
  {
    label: 'IdP Node Marketing Name TH',
    value: row => row.idp_name_obj.marketing_name_th,
  },
  {
    label: 'IdP Node Marketing Name EN',
    value: row => row.idp_name_obj.marketing_name_en,
  },
  {
    label: 'IdP Node Proxy or Subsidiary Name TH',
    value: row => row.idp_name_obj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'IdP Node Proxy or Subsidiary Name EN',
    value: row => row.idp_name_obj.proxy_or_subsidiary_name_en,
  }, {
    label: 'Requested IAL',
    value: 'min_ial',
  }, {
    label: 'Requested AAL',
    value: 'min_aal',
  }, {
    label: 'Response IAL',
    value: 'ial',
  }, {
    label: 'Response AAL',
    value: 'aal',
  }, {
    label: 'IdP Response',
    value: 'response',
  }, {
    label: 'Valid IdP Response Signature',
    value: 'valid_idp_response_signature',
  }, {
    label: 'Valid IdP Response IAL',
    value: 'valid_idp_response_ial',
  }, {
    label: 'IdP Price',
    value: row => row.price.toFixed(2),
    stringify: false,
  }, {
    label: 'IdP Full Price',
    value: row => row.full_price.toFixed(2),
    stringify: false,
  },
];
const fieldsRpIdpSummary = [
  {
    label: 'RP Node ID',
    value: 'rpId',
  }, {
    label: 'RP Node Name',
    value: 'rpName',
  }, {
    label: 'RP Node Industry Code',
    value: row => row.rpNameObj.industry_code,
  },
  {
    label: 'RP Node Company Code',
    value: row => row.rpNameObj.company_code,
  },
  {
    label: 'RP Node Marketing Name TH',
    value: row => row.rpNameObj.marketing_name_th,
  },
  {
    label: 'RP Node Marketing Name EN',
    value: row => row.rpNameObj.marketing_name_en,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name TH',
    value: row => row.rpNameObj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name EN',
    value: row => row.rpNameObj.proxy_or_subsidiary_name_en,
  }, {
    label: 'IdP Node ID',
    value: 'idpId',
  }, {
    label: 'IdP Node Name',
    value: 'idpName',
  }, {
    label: 'IdP Node Industry Code',
    value: row => row.idpNameObj.industry_code,
  },
  {
    label: 'IdP Node Company Code',
    value: row => row.idpNameObj.company_code,
  },
  {
    label: 'IdP Node Marketing Name TH',
    value: row => row.idpNameObj.marketing_name_th,
  },
  {
    label: 'IdP Node Marketing Name EN',
    value: row => row.idpNameObj.marketing_name_en,
  },
  {
    label: 'IdP Node Proxy or Subsidiary Name TH',
    value: row => row.idpNameObj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'IdP Node Proxy or Subsidiary Name EN',
    value: row => row.idpNameObj.proxy_or_subsidiary_name_en,
  }, {
    label: 'IdP Price',
    value: row => row.idpPrice.toFixed(2),
    stringify: false,
  },
];

const fieldsRpAs = [
  {
    label: 'RP Node ID',
    value: 'rp_id',
  }, {
    label: 'RP Node Name',
    value: 'rp_name',
  }, {
    label: 'RP Node Industry Code',
    value: row => row.rp_name_obj.industry_code,
  },
  {
    label: 'RP Node Company Code',
    value: row => row.rp_name_obj.company_code,
  },
  {
    label: 'RP Node Marketing Name TH',
    value: row => row.rp_name_obj.marketing_name_th,
  },
  {
    label: 'RP Node Marketing Name EN',
    value: row => row.rp_name_obj.marketing_name_en,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name TH',
    value: row => row.rp_name_obj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name EN',
    value: row => row.rp_name_obj.proxy_or_subsidiary_name_en,
  }, {
    label: 'Request ID',
    value: 'request_id',
  }, {
    label: 'Request Status',
    value: 'status',
  }, {
    label: 'Closed',
    value: 'closed',
  }, {
    label: 'Timed out',
    value: 'timed_out',
  }, {
    label: 'Created Block Height',
    value: 'height',
  }, {
    label: 'Mode',
    value: 'mode',
  }, {
    label: 'AS Node ID',
    value: 'as_id',
  }, {
    label: 'AS Node Name',
    value: 'as_name',
  }, {
    label: 'AS Node Industry Code',
    value: row => row.as_name_obj.industry_code,
  },
  {
    label: 'AS Node Company Code',
    value: row => row.as_name_obj.company_code,
  },
  {
    label: 'AS Node Marketing Name TH',
    value: row => row.as_name_obj.marketing_name_th,
  },
  {
    label: 'AS Node Marketing Name EN',
    value: row => row.as_name_obj.marketing_name_en,
  },
  {
    label: 'AS Node Proxy or Subsidiary Name TH',
    value: row => row.as_name_obj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'AS Node Proxy or Subsidiary Name EN',
    value: row => row.as_name_obj.proxy_or_subsidiary_name_en,
  }, {
    label: 'AS Service ID',
    value: 'service_id',
  }, {
    label: 'Data Answered',
    value: 'data_answered',
  }, {
    label: 'Data Received',
    value: 'data_received',
  }, {
    label: 'AS Price',
    value: row => row.price.toFixed(2),
    stringify: false,
  }, {
    label: 'AS Full Price',
    value: row => row.full_price.toFixed(2),
    stringify: false,
  },
];
const fieldsRpAsSummary = [
  {
    label: 'RP Node ID',
    value: 'rpId',
  }, {
    label: 'RP Node Name',
    value: 'rpName',
  }, {
    label: 'RP Node Industry Code',
    value: row => row.rpNameObj.industry_code,
  },
  {
    label: 'RP Node Company Code',
    value: row => row.rpNameObj.company_code,
  },
  {
    label: 'RP Node Marketing Name TH',
    value: row => row.rpNameObj.marketing_name_th,
  },
  {
    label: 'RP Node Marketing Name EN',
    value: row => row.rpNameObj.marketing_name_en,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name TH',
    value: row => row.rpNameObj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name EN',
    value: row => row.rpNameObj.proxy_or_subsidiary_name_en,
  }, {
    label: 'AS Node ID',
    value: 'asId',
  }, {
    label: 'AS Node Name',
    value: 'asName',
  }, {
    label: 'AS Node Industry Code',
    value: row => row.asNameObj.industry_code,
  },
  {
    label: 'AS Node Company Code',
    value: row => row.asNameObj.company_code,
  },
  {
    label: 'AS Node Marketing Name TH',
    value: row => row.asNameObj.marketing_name_th,
  },
  {
    label: 'AS Node Marketing Name EN',
    value: row => row.asNameObj.marketing_name_en,
  },
  {
    label: 'AS Node Proxy or Subsidiary Name TH',
    value: row => row.asNameObj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'AS Node Proxy or Subsidiary Name EN',
    value: row => row.asNameObj.proxy_or_subsidiary_name_en,
  }, {
    label: 'AS Service ID',
    value: 'serviceId',
  }, {
    label: 'AS Price',
    value: row => row.asPrice.toFixed(2),
    stringify: false,
  },
];

const fieldsRpNdid = [
  {
    label: 'RP Node ID',
    value: 'rp_id',
  }, {
    label: 'RP Node Name',
    value: 'rp_name',
  }, {
    label: 'RP Node Industry Code',
    value: row => row.rp_name_obj.industry_code,
  },
  {
    label: 'RP Node Company Code',
    value: row => row.rp_name_obj.company_code,
  },
  {
    label: 'RP Node Marketing Name TH',
    value: row => row.rp_name_obj.marketing_name_th,
  },
  {
    label: 'RP Node Marketing Name EN',
    value: row => row.rp_name_obj.marketing_name_en,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name TH',
    value: row => row.rp_name_obj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name EN',
    value: row => row.rp_name_obj.proxy_or_subsidiary_name_en,
  }, {
    label: 'Request ID',
    value: 'request_id',
  }, {
    label: 'Request Status',
    value: 'status',
  }, {
    label: 'Closed',
    value: 'closed',
  }, {
    label: 'Timed out',
    value: 'timed_out',
  }, {
    label: 'Created Block Height',
    value: 'height',
  }, {
    label: 'Mode',
    value: 'mode',
  }, {
    label: 'Number of Stamps',
    value: 'numberOfStamps',
  },
];
const fieldsRpNdidSummary = [
  {
    label: 'RP Node ID',
    value: 'rpId',
  }, {
    label: 'RP Node Name',
    value: 'rpName',
  }, {
    label: 'RP Node Industry Code',
    value: row => row.rpNameObj.industry_code,
  },
  {
    label: 'RP Node Company Code',
    value: row => row.rpNameObj.company_code,
  },
  {
    label: 'RP Node Marketing Name TH',
    value: row => row.rpNameObj.marketing_name_th,
  },
  {
    label: 'RP Node Marketing Name EN',
    value: row => row.rpNameObj.marketing_name_en,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name TH',
    value: row => row.rpNameObj.proxy_or_subsidiary_name_th,
  },
  {
    label: 'RP Node Proxy or Subsidiary Name EN',
    value: row => row.rpNameObj.proxy_or_subsidiary_name_en,
  }, {
    label: 'Number of Transactions',
    value: 'numberOfTxns',
  }, {
    label: 'Number of Stamps',
    value: 'numberOfStamps',
  },
];
const fieldsRpNdidSummaryByOrg = [
  {
    label: 'Organization',
    value: 'org',
  }, {
    label: 'Plan',
    value: 'rpPlan',
  }, {
    label: 'Number of Transactions',
    value: 'numberOfTxns',
  }, {
    label: 'Number of Stamps',
    value: 'numberOfStamps',
  }, {
    label: 'NDID Price',
    value: row => (isNaN(row.ndidPrice) ? `"${row.ndidPrice}"` : Number(row.ndidPrice).toFixed(2)),
    stringify: false,
  },
];

const pendingParser = new Json2csvParser({ fields: fieldsPending });

const rpIdpParser = new Json2csvParser({ fields: fieldsRpIdp });
const rpIdpSumParser = new Json2csvParser({ fields: fieldsRpIdpSummary });

const rpAsParser = new Json2csvParser({ fields: fieldsRpAs });
const rpAsSumParser = new Json2csvParser({ fields: fieldsRpAsSummary });

const rpNdidParser = new Json2csvParser({ fields: fieldsRpNdid });
const rpNdidSumParser = new Json2csvParser({ fields: fieldsRpNdidSummary });
const rpNdidSumByOrgParser = new Json2csvParser({ fields: fieldsRpNdidSummaryByOrg });

module.exports = {
  pendingParser,
  rpIdpParser,
  rpIdpSumParser,
  rpAsParser,
  rpAsSumParser,
  rpNdidParser,
  rpNdidSumParser,
  rpNdidSumByOrgParser,
};
