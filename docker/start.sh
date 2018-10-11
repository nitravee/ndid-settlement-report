#!/bin/sh

QUERY_SETTLEMENT=${QUERY_SETTLEMENT:-YES}
MIN_BLOCK_HEIGHT=${MIN_BLOCK_HEIGHT:-}
MAX_BLOCK_HEIGHT=${MAX_BLOCK_HEIGHT:-5555}

if [ "$QUERY_SETTLEMENT" = "YES"]
then
  python ./settlement-query/getSettlementData.py
fi

node ./settlement-report/genSettlementReport -r ./GetUsedTokenReport/ -d ./RequestDetail/ -p ./Prices/ -b "$MIN_BLOCK_HEIGHT" -e "$MAX_BLOCK_HEIGHT" -o ./Reports
