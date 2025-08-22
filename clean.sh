# script to clean the logs

LOG_DIR="./logs"

echo "Cleaning logs in $LOG_DIR"

if [ -d "$LOG_DIR" ]; then
    find "$LOG_DIR" -mindepth 1 -exec rm -rf {} +
    echo "Done."
else
    echo "Unable."
fi
