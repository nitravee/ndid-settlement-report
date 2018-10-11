#!/bin/sh

QUERY_SETTLEMENT=${QUERY_SETTLEMENT:-YES}
MIN_BLOCK_HEIGHT=${MIN_BLOCK_HEIGHT}
MAX_BLOCK_HEIGHT=${MAX_BLOCK_HEIGHT}

if [ "${QUERY_SETTLEMENT}" = "YES" ]
then
  echo 'Begin querying blockchain.'
  python ./settlement-query/getSettlementData.py
  echo 'Query blockchain succeeded.'
  echo ''
else
  echo 'Bypass querying blockchain.'
  echo ''
fi

node ./settlement-report/genSettlementReport -r ./GetUsedTokenReport/ -d ./RequestDetail/ -p ./Prices/ -b "${MIN_BLOCK_HEIGHT}" -e "${MAX_BLOCK_HEIGHT}" -o ./Reports
