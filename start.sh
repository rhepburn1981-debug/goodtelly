#!/bin/bash

echo "Starting backend..."
cd filmshare-api
uvicorn main:app --host 0.0.0.0 --port 8000 &

echo "Starting v3..."
cd ../v3

# Example (adjust based on your stack)
# If Node:
npm install
npm start &

# If static (HTML):
# python -m http.server 3000 &

wait