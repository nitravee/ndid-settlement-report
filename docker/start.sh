#!/bin/sh

TM_RPC_IP=${TM_RPC_IP:-127.0.0.1}
TM_RPC_PORT=${TM_RPC_PORT:-26000}
QUERY_SETTLEMENT=${QUERY_SETTLEMENT:-YES}
MIN_BLOCK_HEIGHT=${MIN_BLOCK_HEIGHT}
MAX_BLOCK_HEIGHT=${MAX_BLOCK_HEIGHT}
DEBUG_FILE=${DEBUG_FILE:-NO}

if [ "${QUERY_SETTLEMENT}" = "YES" ]
then  
  printf 'Started querying blockchain.'
  TM_RPC_IP=$TM_RPC_IP TM_RPC_PORT=$TM_RPC_PORT python ./settlement-query/getSettlementData.py
  printf 'Query blockchain succeeded.\n'
else
  printf 'Skipped querying blockchain.\n'
fi

if [ "${DEBUG_FILE}" = "YES"]
then
  CREATE_DEBUG_FILE=true
else
  CREATE_DEBUG_FILE=false
fi

node ./settlement-report/genSettlementReport \
  -r ./GetUsedTokenReport/ \
  -d ./RequestDetail/ \
  -p ./Prices/ \
  -n ./Plan/ \
  -g ./Group/ \
  -v ./pendingRequests.json \
  -c "${CHAIN_ID}" \
  -b "${MIN_BLOCK_HEIGHT}" \
  -e "${MAX_BLOCK_HEIGHT}" \
  -o ./Reports \
  -w ./WebPortal \
  --month="${MONTH}" \
  --bill-period-start="${BILL_PERIOD_START}" \
  --bill-period-end="${BILL_PERIOD_END}" \
  --tm-rpc-ip=$TM_RPC_IP \
  --tm-rpc-port=$TM_RPC_PORT \
  --next-round=./NextRound/ \
  --portal-sub-dir=$PORTAL_SUB_DIR \
  --create-latest=$CREATE_LATEST \
  --debug-file=$CREATE_DEBUG_FILE
