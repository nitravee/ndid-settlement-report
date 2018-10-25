#!/bin/sh

TM_RPC_IP=${TM_RPC_IP:-127.0.0.1}
TM_RPC_PORT=${TM_RPC_PORT:-26000}
QUERY_SETTLEMENT=${QUERY_SETTLEMENT:-YES}
MIN_BLOCK_HEIGHT=${MIN_BLOCK_HEIGHT}
MAX_BLOCK_HEIGHT=${MAX_BLOCK_HEIGHT}

if [ "${QUERY_SETTLEMENT}" = "YES" ]
then  
  printf 'Started querying blockchain.'
  TM_RPC_IP=$TM_RPC_IP TM_RPC_PORT=$TM_RPC_PORT python ./settlement-query/getSettlementData.py
  printf 'Query blockchain succeeded.\n'
else
  printf 'Skipped querying blockchain.\n'
fi

node ./settlement-report/genSettlementReport \
  -i ./NodeInfo/ \
  -r ./GetUsedTokenReport/ \
  -d ./RequestDetail/ \
  -p ./Prices/ \
  -v ./pendingRequests.json \
  -b "${MIN_BLOCK_HEIGHT}" \
  -e "${MAX_BLOCK_HEIGHT}" \
  -o ./Reports
