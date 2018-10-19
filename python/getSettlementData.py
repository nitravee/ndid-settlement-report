import os
import urllib
import urllib2
import json
import base64
import os.path
import tendermint_pb2

if 'TM_RPC_IP' in os.environ:
    tm_rpc_ip = os.environ["TM_RPC_IP"]
else:
    tm_rpc_ip = 'localhost'

if 'TM_RPC_PORT' in os.environ:
    tm_rpc_port = os.environ["TM_RPC_PORT"]
else:
    tm_rpc_port = 26000

tm_rpc_domain = tm_rpc_ip + ':' + tm_rpc_port

if 'START_BLOCK' in os.environ:
    start_block = os.environ["START_BLOCK"]
else:
    start_block = 1

if 'END_BLOCK' in os.environ:
    end_block = os.environ["END_BLOCK"]
else:
    json_result = urllib2.urlopen('http://' + tm_rpc_domain + '/abci_info').read()
    result = json.loads(json_result)
    end_block = result['result']['response']['last_block_height']

start_block = int(start_block)
end_block = int(end_block) + 1

final_result = {}

for height in range(start_block, end_block):
    print('Start get Block: ' + str(height))
    json_block = urllib2.urlopen('http://' + tm_rpc_domain + '/block?height=' +
                                 str(height)).read()
    block = json.loads(json_block)
    json_block_result = urllib2.urlopen(
        'http://' + tm_rpc_domain + '/block_results?height=' + str(height)).read()
    block_result = json.loads(json_block_result)
    if block['result']['block']['data']['txs'] is not None:
        index = 0
        for tx in block['result']['block']['data']['txs']:
            chkTagSuccess = False
            for tag in block_result['result']['results']['DeliverTx'][index][
                    'tags']:
                if base64.b64decode(
                        tag['key']) == 'success' and base64.b64decode(
                            tag['value']) == 'true':
                    chkTagSuccess = True
            if chkTagSuccess:

                txObj = tendermint_pb2.Tx()
                decodedTx = base64.b64decode(tx)
                txObj.ParseFromString(decodedTx)

                method = txObj.method
                node_id = txObj.node_id
                if node_id not in final_result:
                    final_result[node_id] = []

                row = {}
                row['method'] = method
                if 'data' in block_result['result']['results']['DeliverTx'][
                        index]:
                    row['request_id'] = base64.b64decode(block_result[
                        'result']['results']['DeliverTx'][index]['data'])

                func = 'GetPriceFunc'
                param = {}
                param['func'] = method
                json_param = json.dumps(param)
                queryObj = tendermint_pb2.Query()
                queryObj.method = func
                queryObj.params = json_param
                data = '0x' + queryObj.SerializeToString().encode(
                    "utf-8").encode("hex")
                params = urllib.urlencode({'data': data})
                req = urllib2.urlopen('http://' + tm_rpc_domain + '/abci_query?' +
                                      params)
                json_result = req.read()
                result = json.loads(json_result)
                decodedResult = base64.b64decode(
                    result['result']['response']['value'])
                objResult = json.loads(decodedResult)
                row['price'] = objResult['price']
                row['height'] = height

                final_result[node_id].append(row)
            index += 1
    print('End get Block: ' + str(height))

dirNodeInfo = 'NodeInfo'
dirUsedToken = 'GetUsedTokenReport'
dirRequest = 'RequestDetail'

try:
    os.mkdir(dirNodeInfo)
except Exception:
    pass

try:
    os.mkdir(dirUsedToken)
except Exception:
    pass

try:
    os.mkdir(dirRequest)
except Exception:
    pass

for the_file in os.listdir(dirNodeInfo):
    file_path = os.path.join(dirNodeInfo, the_file)
    try:
        if os.path.isfile(file_path):
            os.unlink(file_path)
    except Exception as e:
        print(e)

for the_file in os.listdir(dirUsedToken):
    file_path = os.path.join(dirUsedToken, the_file)
    try:
        if os.path.isfile(file_path):
            os.unlink(file_path)
    except Exception as e:
        print(e)

for the_file in os.listdir(dirRequest):
    file_path = os.path.join(dirRequest, the_file)
    try:
        if os.path.isfile(file_path):
            os.unlink(file_path)
    except Exception as e:
        print(e)

for node_id in final_result:
    usedToken = final_result[node_id]
    with open(os.path.join(dirUsedToken, node_id + '.json'), 'w') as outfile:
        outfile.write(json.dumps(usedToken, indent=2))
        outfile.close()

    func = 'GetNodeInfo'
    param = {}
    param['node_id'] = node_id
    json_param = json.dumps(param)
    queryObj = tendermint_pb2.Query()
    queryObj.method = func
    queryObj.params = json_param
    data = '0x' + queryObj.SerializeToString().encode(
        "utf-8").encode("hex")
    params = urllib.urlencode({'data': data})
    req = urllib2.urlopen('http://' + tm_rpc_domain + '/abci_query?' +
                            params)
    json_result = req.read()
    result = json.loads(json_result)
    data = base64.b64decode(result['result']['response']['value'])
    nodeInfo = json.loads(data)
    with open(os.path.join(dirNodeInfo, node_id + '.json'), 'w') as outfile:
        outfile.write(json.dumps(nodeInfo, indent=2))
        outfile.close()

    for item in usedToken:
        if (item['method'] == 'CreateRequest'):
            
            func = 'GetRequestDetail'
            param = {}
            param['request_id'] = item['request_id']
            json_param = json.dumps(param)
            queryObj = tendermint_pb2.Query()
            queryObj.method = func
            queryObj.params = json_param
            data = '0x' + queryObj.SerializeToString().encode(
                "utf-8").encode("hex")
            params = urllib.urlencode({'data': data})
            req = urllib2.urlopen('http://' + tm_rpc_domain + '/abci_query?' +
                                    params)
            json_result = req.read()
            result = json.loads(json_result)
            data = base64.b64decode(result['result']['response']['value'])
            requestDetail = json.loads(data)
            with open(
                    os.path.join(dirRequest, item['request_id'] + '.json'),
                    'w') as outfile:
                outfile.write(json.dumps(requestDetail, indent=2))
                outfile.close()
