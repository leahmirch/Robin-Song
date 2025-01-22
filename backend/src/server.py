from flask import Flask, jsonify, request
import subprocess
import psutil
import os
import signal
from firebase_admin import credentials, firestore, initialize_app

app = Flask(__name__)

cred = credentials.Certificate(os.path.join(os.getcwd(), "backend/secrets/firebase-admin-key.json"))
initialize_app(cred)
db = firestore.client()

is_running = False
process = None  

def terminate_process_and_children(proc_pid):
    try:
        parent = psutil.Process(proc_pid)
        for child in parent.children(recursive=True):
            child.terminate()
        parent.terminate()
    except psutil.NoSuchProcess:
        pass


# Bird Detection Endpoints
@app.route('/start-detection', methods=['POST'])
def start_detection():
    global is_running, process
    if not is_running:
        try:
            process = subprocess.Popen(["python", "detect_birds.py"])
            is_running = True
            return jsonify({"message": "Bird detection started"})
        except Exception as e:
            return jsonify({"message": f"Error starting detection: {str(e)}"}), 500
    else:
        return jsonify({"message": "Bird detection is already running"}), 400


@app.route('/stop-detection', methods=['POST'])
def stop_detection():
    global is_running, process
    if is_running and process:
        try:
            terminate_process_and_children(process.pid)
            process = None
            is_running = False
            return jsonify({"message": "Bird detection stopped"})
        except Exception as e:
            return jsonify({"message": f"Error stopping detection: {str(e)}"}), 500
    else:
        return jsonify({"message": "Bird detection is not running"}), 400


@app.route('/status', methods=['GET'])
def status():
    global is_running
    return jsonify({"running": is_running})


# User Endpoints
@app.route('/users', methods=['POST'])
def add_user():
    """Add a new user."""
    try:
        data = request.json
        user = {
            "firstName": data["firstName"],
            "lastName": data["lastName"],
            "email": data["email"],
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
        user_ref = db.collection("users").add(user)
        return jsonify({"message": "User added", "userId": user_ref[1].id})
    except Exception as e:
        return jsonify({"error": f"Error adding user: {str(e)}"}), 500


@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Fetch a user by ID."""
    try:
        user_ref = db.collection("users").document(user_id).get()
        if user_ref.exists:
            return jsonify(user_ref.to_dict())
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Error fetching user: {str(e)}"}), 500


# Chat Endpoints
@app.route('/chats/<user_id>', methods=['GET'])
def get_user_chats(user_id):
    """Fetch all chats for a user."""
    try:
        chats = db.collection("chats").where("userId", "==", user_id).stream()
        chat_list = [{"chatId": chat.id, **chat.to_dict()} for chat in chats]
        return jsonify(chat_list)
    except Exception as e:
        return jsonify({"error": f"Error fetching chats: {str(e)}"}), 500


@app.route('/chats', methods=['POST'])
def create_chat():
    """Create a new chat for a user."""
    try:
        data = request.json
        chat = {
            "userId": data["userId"],
            "title": data["title"],
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        chat_ref = db.collection("chats").add(chat)
        return jsonify({"message": "Chat created", "chatId": chat_ref[1].id})
    except Exception as e:
        return jsonify({"error": f"Error creating chat: {str(e)}"}), 500


@app.route('/chats/<chat_id>/messages', methods=['POST'])
def add_message_to_chat(chat_id):
    """Add a message to an existing chat."""
    try:
        data = request.json
        message = {
            "content": data["content"],
            "timestamp": firestore.SERVER_TIMESTAMP
        }
        messages_ref = db.collection("chats").document(chat_id).collection("messages")
        message_ref = messages_ref.add(message)
        return jsonify({"message": "Message added", "messageId": message_ref[1].id})
    except Exception as e:
        return jsonify({"error": f"Error adding message: {str(e)}"}), 500


@app.route('/chats/<chat_id>/messages', methods=['GET'])
def get_chat_messages(chat_id):
    """Fetch all messages for a chat."""
    try:
        messages_ref = db.collection("chats").document(chat_id).collection("messages")
        snapshot = messages_ref.order_by("timestamp").stream()
        messages = [{"messageId": message.id, **message.to_dict()} for message in snapshot]
        return jsonify(messages)
    except Exception as e:
        return jsonify({"error": f"Error fetching messages: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)