#/bin/bash

CHAIN_ID=$(cat ./settlement/NextRound/nextRound.json | jq -r .chain_id)
MIN_HEIGHT=$(cat ./settlement/NextRound/nextRound.json | jq -r .min_block_height)
PERIOD_START=$(cat ./settlement/NextRound/nextRound.json | jq -r .bill_period_start)
MAX_HEIGHT=$(curl -s http://localhost:45000/status | jq -r .result.sync_info.latest_block_height)

# 1 Minutes (Test Only)
PORTAL_SUB_DIR=one_min
PERIOD_END=$(date "+%Y%m%d%H%M%S")

# Daily
# PORTAL_SUB_DIR=daily
# PERIOD_END=$(date "+%d-%b-%Y 00:00:00")

# Monthly
# PORTAL_SUB_DIR=monthly
# PERIOD_END=$(date "+%d-%b-%Y 00:00:00")

echo $CHAIN_ID
echo $MIN_HEIGHT
echo $MAX_HEIGHT
echo $PERIOD_START
echo $PERIOD_END

# EXEC_DATETIME=$(date +%Y%m%d_%H%M%S) docker-compose -f docker-compose.yml up $@

EXEC_DATETIME=$(date "+%Y%m%d%H%M%S") \
CHAIN_ID=$CHAIN_ID \
MIN_BLOCK_HEIGHT=$MIN_HEIGHT \
MAX_BLOCK_HEIGHT=$MAX_HEIGHT \
BILL_PERIOD_START=$PERIOD_START \
BILL_PERIOD_END=$PERIOD_END \
PORTAL_SUB_DIR=$PORTAL_SUB_DIR \
CREATE_LATEST=YES \
docker-compose -f docker-compose.yml up $@