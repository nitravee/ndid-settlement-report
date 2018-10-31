const { argv } = require('yargs');
const axios = require('axios');


const tmRpcIp = argv['tm-rpc-ip'] || 'localhost';
const tmRpcPort = argv['tm-rpc-port'] || 26000;
const tmRpcDomain = `${tmRpcIp}:${tmRpcPort}`;


async function tmHttpCall(method, params) {
  let uri = `http://${tmRpcDomain}/${method}`;
  if (params != null) {
    const queryString = params.reduce((paramsString, param) => {
      if (param.key == null || param.value == null) {
        return paramsString;
      }
      const uriEncodedParamValue = encodeURIComponent(param.value);
      if (paramsString !== '') {
        return `${paramsString}&${param.key}=${uriEncodedParamValue}`;
      }
      return `${paramsString}${param.key}=${uriEncodedParamValue}`;
    }, '');

    if (params.length > 0) {
      uri = `${uri}?${queryString}`;
    }
  }

  const response = await axios.get(uri);
  const { data: responseJson } = response;

  if (responseJson.error) {
    // throw new CustomError({
    //   message: 'JSON-RPC ERROR',
    //   details: {
    //     uri,
    //     error: responseJson.error,
    //   },
    // });
    throw responseJson.error;
  }

  return responseJson.result;
}

function abciQuery(data, height) {
  return tmHttpCall('abci_query', [
    {
      key: 'data',
      value: `0x${data}`,
    },
    {
      key: 'height',
      value: height,
    },
  ]);
}

module.exports = { tmHttpCall, abciQuery };
