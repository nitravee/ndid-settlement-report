// App code here

const value = require('./expected1');
const Json2csvParser = require('json2csv').Parser;


function genCSV() {
  const fields_rp_idp = [
    {
      label: 'RP Node ID',
      value: 'rp_node_id',
    }, {
      label: 'Request ID',
      value: 'request_id',
    }, {
      label: 'Request Status',
      value: 'status',
    }, {
      label: 'Created Block Height',
      value: 'height',
    }, {
      label: 'IdP Node ID',
      value: 'idp_id',
    }, {
      label: 'Requested IAL',
      value: 'ial',
    }, {
      label: 'Requested AAL',
      value: 'aal',
    }, {
      label: 'IdP Response',
      value: 'response',
    }, {
      label: 'IdP Price',
      value: 'price',
    }, {
      label: 'IdP Full Price',
      value: 'full_price',
    },
  ];
  
  const fields_rp_as = [
    {
      label: 'RP Node ID',
      value: 'rp_node_id',
    }, {
      label: 'Request ID',
      value: 'request_id',
    }, {
      label: 'Request Status',
      value: 'status',
    }, {
      label: 'Created Block Height',
      value: 'height',
    }, {
      label: 'AS Node ID',
      value: 'as_id',
    }, {
      label: 'AS Service ID',
      value: 'service_id',
    }, {
      label: 'AS Price',
      value: 'price',
    },
  ];

  const settlement = value['1de6e10b2933948cdca039081f5eacd02683e74b51db62e55da60d61dca558ba'].settlement;

  const rp_idp = [];
  settlement.idpList.map((item) => {
    const request = {};
    request.rp_node_id = settlement.requester_node_id;
    request.request_id = settlement.request_id;
    if (settlement.closed) {
      request.status = 'Complete';
    } else {
      request.status = 'Timeout';
    }
    request.height = settlement.height;
    request.idp_id = item.idp_id;
    request.ial = item.ial;
    request.aal = item.aal;
    request.response = item.status;
    request.price = item.idp_price;
    request.full_price = item.idp_full_price;

    rp_idp.push(request);
  });

  const rp_as = [];
  settlement.asList.map((item) => {
    const request = {};
    request.rp_node_id = settlement.requester_node_id;
    request.request_id = settlement.request_id;
    if (settlement.closed) {
      request.status = 'Complete';
    } else {
      request.status = 'Timeout';
    }
    request.height = settlement.height;
    request.as_id = item.as_id;
    request.service_id = item.service_id;
    request.price = item.as_fee;

    rp_as.push(request);
  });

  const rp_idp_parser = new Json2csvParser({ fields_rp_idp });
  const rp_idp_csv = rp_idp_parser.parse(rp_idp);

  const rp_as_parser = new Json2csvParser({ fields_rp_as });
  const rp_as_csv = rp_as_parser.parse(rp_as);

  console.log(rp_idp_csv);
  console.log(rp_as_csv);
}

genCSV();
