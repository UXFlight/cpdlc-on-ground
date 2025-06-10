#!/bin/bash

LOG_DIR="./logs"

echo "Cleaning logs in $LOG_DIR"

if [ -d "$LOG_DIR" ]; then
    find "$LOG_DIR" -mindepth 1 -exec rm -rf {} +
    echo "Logs cleaned."
else
    echo "Directory $LOG_DIR does not exist."
fi
