const protobuf = require('protobufjs');
const { resolve } = require('path');
const tmHttpClient = require('./tmHttpClient');

const tendermintProtobufRootInstance = new protobuf.Root();
const tendermintProtobufRoot = tendermintProtobufRootInstance.loadSync(
  resolve(__dirname, '../../protos/tendermint.proto'),
  { keepCase: true },
);
const tendermintQuery = tendermintProtobufRoot.lookupType('Query');


function getQueryResult(result) {
  // logger.debug({
  //   message: 'Tendermint query result',
  //   result,
  // });

  if (result.response.log.indexOf('not found') !== -1) {
    return null;
  }

  if (result.response.value == null) {
    // throw new CustomError({
    //   errorType: errorType.TENDERMINT_QUERY_ERROR,
    //   details: result,
    // });
    throw new Error('Tendermint query error');
  }

  const queryResult = Buffer.from(result.response.value, 'base64').toString();

  const parsedResultValue = JSON.parse(queryResult);

  // logger.debug({
  //   message: 'Tendermint query parsed result value',
  //   parsedResultValue,
  // });

  return parsedResultValue;
}

async function query(fnName, params, height) {
  // logger.debug({
  //   message: "Tendermint query",
  //   fnName,
  //   params
  // });

  const paramsJsonString = JSON.stringify(params);

  const queryObject = {
    method: fnName,
    params: paramsJsonString,
  };
  const queryProto = tendermintQuery.create(queryObject);
  const queryProtoBuffer = tendermintQuery.encode(queryProto).finish();
  const queryProtoBufferHex = queryProtoBuffer.toString('hex');

  const result = await tmHttpClient.abciQuery(
    queryProtoBufferHex,
    height,
  );
  return getQueryResult(result);
}

module.exports = {
  query,
};
