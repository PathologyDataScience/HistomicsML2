#!/bin/bash

redis-server --daemonize yes

echo "========================================"
echo "== Redis server is successfully loaded =="
echo "========================================"

service apache2 start

echo "==========================================="
echo "== Apartch server is successfully loaded =="
echo "==========================================="

cd /var/www/html/predict-rest-api

python run_model_server.py

echo "===================================================="
echo "== Model server is disconnected ===================="
echo "== Run "./restart.sh" to restart the model server =="
echo "===================================================="

