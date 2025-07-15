#!/bin/bash
cd /home/kavia/workspace/code-generation/floral-market-online-shop-1ec2acbf/flower_shop_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

