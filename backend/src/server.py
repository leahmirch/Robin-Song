import sys
import os
import json
import logging
import wave
import numpy as np
from datetime import datetime
from pytz import timezone
from flask import Flask, jsonify, request
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app, auth
import firebase_admin
import bcrypt
import psutil
import signal
import subprocess
import werkzeug
from pydub import AudioSegment  # For M4A -> WAV conversion
from birdnetlib import Recording
from birdnetlib.analyzer import Analyzer
from bs4 import BeautifulSoup
import requests

# Optional: adjust logging for BirdNET library
logging.getLogger("birdnetlib").setLevel(logging.ERROR)

# Load bird data from JSON file (adjust path if needed)
with open(os.path.join(os.getcwd(), "backend/src/bird_data.json"), "r", encoding="utf-8") as file:
    bird_data = json.load(file)

# Global variables for dynamic noise-floor calibration
NOISE_FLOOR_THRESHOLD = 1e6
ALPHA = 0.9

app = Flask(__name__)
CORS(app)

# Initialize Firebase
cred = credentials.Certificate(os.path.join(os.getcwd(), "backend/secrets/firebase-admin-key.json"))
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize BirdNET analyzer
analyzer = Analyzer()
analyzer.verbose = False

def terminate_process_and_children(proc_pid):
    try:
        parent = psutil.Process(proc_pid)
        for child in parent.children(recursive=True):
            child.terminate()
        parent.terminate()
    except psutil.NoSuchProcess:
        pass

def adjust_floor(current_thresh, observed_power, alpha=0.9):
    return alpha * current_thresh + (1 - alpha) * observed_power

@app.route('/bird-info', methods=['GET'])
def get_bird_info():
    """
    Lookup the Audubon URL for a given bird from the bird_data.json lookup.
    """
    bird_name = request.args.get('bird')
    if not bird_name:
        return jsonify({"error": "Bird name is required"}), 400

    bird_url = bird_data.get(bird_name)
    if not bird_url:
        return jsonify({"error": "Bird not found"}), 404

    return jsonify({"name": bird_name, "url": bird_url}), 200
@app.route('/scrape-bird-info', methods=['GET'])
def scrape_bird_info():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "URL is required"}), 400
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        # Extract description
        description_elem = soup.find("div", class_="bird_info_item info_description")
        description_text = (
            description_elem.find("div", class_="content").get_text(strip=True)
            if description_elem else "No description available."
        )

        # Extract At a Glance info
        at_a_glance_elem = soup.find("h2", id="at_a_glance")
        at_a_glance_text = (
            at_a_glance_elem.find_next("div", class_="intro_text").get_text(strip=True)
            if at_a_glance_elem else "No at-a-glance information available."
        )

        # Extract habitat information
        habitat_elem = soup.find("div", class_="bird_info_item info_habitat")
        habitat_text = (
            habitat_elem.find("div", class_="content").get_text(strip=True)
            if habitat_elem else "No habitat information available."
        )

        # Extract main image URL
        image_url = ""
        media_data = soup.find("div", class_="media-data")
        if media_data:
            picture_tag = media_data.find("picture")
            if picture_tag:
                img_tag = picture_tag.find("img")
                if img_tag:
                    if "data-srcset" in img_tag.attrs:
                        image_url = img_tag["data-srcset"].split(" ")[0]
                    elif "srcset" in img_tag.attrs:
                        image_url = img_tag["srcset"].split(" ")[0]
                    elif "src" in img_tag.attrs:
                        image_url = img_tag["src"]

        
# ======================
# Existing Endpoints (e.g., /upload, /register, /login, etc.)
# ======================

@app.route('/upload', methods=['POST'])
def upload():
    global NOISE_FLOOR_THRESHOLD, ALPHA

    if 'file' not in request.files:
        return jsonify({"error": "No file found"}), 400

    uploaded_file = request.files['file']
    raw_filename = werkzeug.utils.secure_filename(uploaded_file.filename)
    uploaded_file.save(raw_filename)

    # Convert M4A -> WAV using pydub
    wav_filename = "temp.wav"
    try:
        audio_data = AudioSegment.from_file(raw_filename, format="m4a")
        audio_data.export(wav_filename, format="wav")
    except Exception as e:
        print("Error converting to WAV:", e)
        if os.path.exists(raw_filename):
            os.remove(raw_filename)
        return jsonify({"error": "Failed to convert M4A to WAV"}), 500

    os.remove(raw_filename)

    lat = float(request.form.get('latitude', 0.0))
    lon = float(request.form.get('longitude', 0.0))

    # Noise-floor check
    with wave.open(wav_filename, 'rb') as wf:
        frames = wf.readframes(wf.getnframes())
        audio_data_np = np.frombuffer(frames, dtype=np.int16)

    fft_data = np.fft.fft(audio_data_np)
    power_spectrum = np.abs(fft_data) ** 2
    max_power = np.max(power_spectrum)

    if max_power < NOISE_FLOOR_THRESHOLD:
        NOISE_FLOOR_THRESHOLD = adjust_floor(NOISE_FLOOR_THRESHOLD, max_power, ALPHA)
        os.remove(wav_filename)
        return jsonify({
            "message": "Below noise threshold, skipping BirdNET",
            "birds": []
        })
    else:
        recording = Recording(analyzer, wav_filename, lat=lat, lon=lon, date=datetime.now(), min_conf=0.25)
        recording.analyze()
        birds = list({item['common_name'] for item in recording.detections})

        eastern = timezone('US/Eastern')
        current_time = datetime.now().astimezone(eastern)
        for bird in birds:
            db.collection("birds").add({
                "bird": bird,
                "latitude": lat,
                "longitude": lon,
                "timestamp": current_time
            })

        os.remove(wav_filename)
        return jsonify({
            "message": "File processed successfully",
            "birds": birds
        })

@app.route('/start-detection', methods=['POST'])
def start_detection():
    global is_running, process
    if not is_running:
        try:
            process = subprocess.Popen(["python", "detect_birds.py"])
            is_running = True
            print("Detection started.")
            return jsonify({"message": "Bird detection started"})
        except Exception as e:
            print(f"Error starting detection: {str(e)}")
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
            print("Detection stopped.")
            return jsonify({"message": "Bird detection stopped"})
        except Exception as e:
            print(f"Error stopping detection: {str(e)}")
            return jsonify({"message": f"Error stopping detection: {str(e)}"}), 500
    else:
        return jsonify({"message": "Bird detection is not running"}), 400

@app.route('/status', methods=['GET'])
def status():
    global is_running
    return jsonify({"running": is_running})

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        first_name = data.get("firstName")
        last_name = data.get("lastName")
        try:
            existing_user = auth.get_user_by_email(email)
            if existing_user:
                return jsonify({"error": "This email is already in use."}), 400
        except firebase_admin.auth.UserNotFoundError:
            pass
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user = auth.create_user(email=email, password=password)
        user_data = {
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "password": hashed_password,
            "voiceCommandsEnabled": False,
            "locationPreferences": "Unknown City, Uknown State",
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        db.collection("users").document(user.uid).set(user_data)
        print(f"User registered successfully: {user.uid}")
        return jsonify({"message": "User registered successfully", "userId": user.uid})
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        return jsonify({"error": f"Error creating user: {str(e)}"}), 500

@app.route('/google-register', methods=['POST'])
def google_register():
    try:
        data = request.json
        email = data.get("email")
        first_name = data.get("firstName", "Google")
        last_name = data.get("lastName", "User")
        uid = data.get("uid")
        if not email or not uid:
            return jsonify({"error": "Missing required fields"}), 400
        user_query = db.collection("users").where("email", "==", email).stream()
        existing_user = next(user_query, None)
        if existing_user:
            return jsonify({"message": "User already exists in Firestore", "userId": existing_user.id}), 200
        user_data = {
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "uid": uid,
            "password": "Google Account",
            "voiceCommandsEnabled": False,
            "locationPreferences": "Unknown City, State",
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        new_user_ref = db.collection("users").add(user_data)
        return jsonify({"message": "Google user registered successfully", "userId": new_user_ref[1].id}), 201
    except Exception as e:
        return jsonify({"error": f"Error registering Google user: {str(e)}"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")
        if not email or not password:
            return jsonify({"error": "Both the email and password are required."}), 400
        user_query = db.collection("users").where("email", "==", email).stream()
        user_doc = next(user_query, None)
        if not user_doc:
            print(f"Login failed: User with email {email} not found")
            return jsonify({"error": "User not found."}), 404
        user_data = user_doc.to_dict()
        stored_password = user_data.get("password")
        if bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
            print(f"Login successful for user: {user_doc.id}")
            return jsonify({"message": "Login successful", "userId": user_doc.id})
        else:
            print(f"Login failed: Incorrect password for user {email}")
            return jsonify({"error": "Invalid credentials."}), 401
    except Exception as e:
        print(f"Error logging in: {str(e)}")
        return jsonify({"error": f"Error logging in: {str(e)}"}), 500

@app.route('/users', methods=['POST'])
def add_user():
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

@app.route('/users/<user_id>/preferences', methods=['PATCH'])
def update_user_preferences(user_id):
    try:
        data = request.json
        updates = {}
        if "voiceCommandsEnabled" in data:
            updates["voiceCommandsEnabled"] = data["voiceCommandsEnabled"]
        if "locationPreferences" in data:
            updates["locationPreferences"] = data["locationPreferences"]
        if updates:
            db.collection("users").document(user_id).update(updates)
        return jsonify({"message": "User preferences updated"}), 200
    except Exception as e:
        return jsonify({"error": f"Error updating preferences: {str(e)}"}), 500

@app.route('/chats/<user_id>', methods=['GET'])
def get_user_chats(user_id):
    try:
        chats = db.collection("chats").where("userId", "==", user_id).stream()
        chat_list = [{"chatId": chat.id, **chat.to_dict()} for chat in chats]
        return jsonify(chat_list)
    except Exception as e:
        return jsonify({"error": f"Error fetching chats: {str(e)}"}), 500

@app.route('/chats', methods=['POST'])
def create_chat():
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
    try:
        messages_ref = db.collection("chats").document(chat_id).collection("messages")
        snapshot = messages_ref.order_by("timestamp").stream()
        messages = [{"messageId": message.id, **message.to_dict()} for message in snapshot]
        return jsonify(messages)
    except Exception as e:
        return jsonify({"error": f"Error fetching messages: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
