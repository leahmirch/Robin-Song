from flask import Flask, jsonify
import subprocess
import psutil  # For managing process trees
import os
import signal

app = Flask(__name__)

# Global variable to manage detection state
is_running = False
process = None  # To manage the subprocess

# Function to terminate the process and all its children
def terminate_process_and_children(proc_pid):
    try:
        parent = psutil.Process(proc_pid)
        for child in parent.children(recursive=True):
            child.terminate()
        parent.terminate()
    except psutil.NoSuchProcess:
        pass


# Start Bird Detection Endpoint
@app.route('/start-detection', methods=['POST'])
def start_detection():
    global is_running, process
    if not is_running:
        try:
            # Start the bird detection script as a subprocess
            process = subprocess.Popen(["python", "detect_birds.py"])
            is_running = True
            return jsonify({"message": "Bird detection started"})
        except Exception as e:
            return jsonify({"message": f"Error starting detection: {str(e)}"}), 500
    else:
        return jsonify({"message": "Bird detection is already running"}), 400


# Stop Bird Detection Endpoint
@app.route('/stop-detection', methods=['POST'])
def stop_detection():
    global is_running, process
    if is_running and process:
        try:
            # Terminate the process and all its children
            terminate_process_and_children(process.pid)
            process = None
            is_running = False
            return jsonify({"message": "Bird detection stopped"})
        except Exception as e:
            return jsonify({"message": f"Error stopping detection: {str(e)}"}), 500
    else:
        return jsonify({"message": "Bird detection is not running"}), 400


# Status Endpoint
@app.route('/status', methods=['GET'])
def status():
    global is_running
    return jsonify({"running": is_running})


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
