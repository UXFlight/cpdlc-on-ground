# script to automatically runs the code on a process that gets killed on SIGINT

VENV_DIR="./venv"
MAIN_SCRIPT="main.py"
URL="http://127.0.0.1:5321"

echo "venv and running $MAIN_SCRIPT"

source "$VENV_DIR/bin/activate"
python3 "$MAIN_SCRIPT" &
PYTHON_PID=$!

cleanup() {
    echo "killing (PID $PYTHON_PID)"
    kill $PYTHON_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM
sleep 2
xdg-open "$URL" >/dev/null 2>&1 &
wait $PYTHON_PID
