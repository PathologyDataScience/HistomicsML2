#!/bin/bash

redis-cli flushdb

echo "==========================================="
echo "== Redis server is successfully reloaded =="
echo "==========================================="

cd /var/www/html/predict-rest-api

python run_model_server.py

echo "===================================================="
echo "== Model server is disconnected ===================="
echo "== Run "./restart.sh" to restart the model server =="
echo "===================================================="

