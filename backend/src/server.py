import os
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
from pydub import AudioSegment
from birdnetlib import Recording
from birdnetlib.analyzer import Analyzer
import json
from bs4 import BeautifulSoup
import requests

import openai
from dotenv import load_dotenv
load_dotenv()
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("Missing OpenAI API Key. Set OPENAI_API_KEY in your environment variables.")
app = Flask(__name__)
CORS(app)

cred = credentials.Certificate(
    os.path.join(os.path.dirname(os.path.dirname(__file__)),
    "secrets/firebase-admin-key.json")
)
initialize_app(cred)
db = firestore.client()

# BirdNET init
analyzer = Analyzer()
analyzer.verbose = False
logging.getLogger("birdnetlib").setLevel(logging.ERROR)

NOISE_FLOOR_THRESHOLD = 1e6
ALPHA = 0.9
is_running = False
process = None  

with open(os.path.join(os.getcwd(), "backend/src/bird_data.json"), "r", encoding="utf-8") as file:
    bird_data = json.load(file)

def terminate_process_and_children(proc_pid):
    """Gracefully terminate a process and any child processes."""
    try:
        parent = psutil.Process(proc_pid)
        for child in parent.children(recursive=True):
            child.terminate()
        parent.terminate()
    except psutil.NoSuchProcess:
        pass

@app.route('/bird-info', methods=['GET'])
def get_bird_info():
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

        # Extract feeding behavior
        feeding_elem = soup.find("div", class_="bird_info_item info_feeding")
        feeding_text = (
            feeding_elem.find("div", class_="content").get_text(strip=True)
            if feeding_elem else "No feeding info available."
        )

        # Extract diet information
        diet_elem = soup.find("div", class_="bird_info_item info_diet")
        diet_text = (
            diet_elem.find("div", class_="content").get_text(strip=True)
            if diet_elem else "No diet info available."
        )

        # Extract scientific name (subtitle)
        subtitle_elem = soup.find("div", class_="subtitle")
        subtitle_text = subtitle_elem.get_text(strip=True) if subtitle_elem else ""

        # Extract size information
        size_elem = soup.find("div", class_="tax-item icons_dictionary_before size_icon")
        size_text = (
            size_elem.find("div", class_="tax-value").get_text(strip=True)
            if size_elem else "No size info available."
        )

        # Extract color information
        color_elem = soup.find("div", class_="tax-item icons_dictionary_before eye_icon")
        color_text = (
            color_elem.find("div", class_="tax-value").get_text(strip=True)
            if color_elem else "No color info available."
        )

        # Extract wing shape
        wing_elem = soup.find("div", class_="tax-item icons_dictionary_before binoculars_icon")
        wing_text = (
            wing_elem.find("div", class_="tax-value").get_text(strip=True)
            if wing_elem else "No wing shape info available."
        )

        # Extract tail shape
        tail_elem = soup.find("div", class_="tax-item icons_dictionary_before tail_icon")
        tail_text = (
            tail_elem.find("div", class_="tax-value").get_text(strip=True)
            if tail_elem else "No tail shape info available."
        )

        # Extract migration text
        migration_elem = soup.find("div", class_="bird_info_item info_migration")
        migration_text = (
            migration_elem.find("div", class_="content").get_text(strip=True)
            if migration_elem else "No migration info available."
        )

        migration_map_url = ""
        rangemap_div = soup.find("div", class_="bird-rangemap")
        if rangemap_div:
            print("\nDEBUG: Found .bird-rangemap:\n", rangemap_div.prettify())
            picture_tag = rangemap_div.find("picture")
            if picture_tag:
                print("DEBUG: Found <picture> in bird-rangemap:\n", picture_tag.prettify())
                # Try <img> first
                img_tag = picture_tag.find("img")
                if img_tag:
                    print("DEBUG: Found <img> in <picture>:", img_tag)
                    if "data-srcset" in img_tag.attrs:
                        migration_map_url = img_tag["data-srcset"].split(" ")[0]
                        print("DEBUG: Using <img> data-srcset ->", migration_map_url)
                    elif "srcset" in img_tag.attrs:
                        migration_map_url = img_tag["srcset"].split(" ")[0]
                        print("DEBUG: Using <img> srcset ->", migration_map_url)
                    elif "src" in img_tag.attrs:
                        migration_map_url = img_tag["src"]
                        print("DEBUG: Using <img> src ->", migration_map_url)
                    else:
                        print("DEBUG: <img> has no data-srcset, srcset, or src")
                else:
                    source_tags = picture_tag.find_all("source")
                    if source_tags:
                        print("DEBUG: Found <source> tags:", source_tags)
                        for source_tag in source_tags:
                            if "data-srcset" in source_tag.attrs:
                                migration_map_url = source_tag["data-srcset"].split(" ")[0]
                                print("DEBUG: Using <source> data-srcset ->", migration_map_url)
                                break
                            elif "srcset" in source_tag.attrs:
                                migration_map_url = source_tag["srcset"].split(" ")[0]
                                print("DEBUG: Using <source> srcset ->", migration_map_url)
                                break
                            elif "src" in source_tag.attrs:
                                migration_map_url = source_tag["src"]
                                print("DEBUG: Using <source> src ->", migration_map_url)
                                break
                    else:
                        print("DEBUG: No <source> or <img> found in <picture>.")
            else:
                print("DEBUG: No <picture> found in .bird-rangemap")
        else:
            print("DEBUG: No .bird-rangemap found in HTML")

        return jsonify({
            "description": description_text,
            "at_a_glance": at_a_glance_text,
            "habitat": habitat_text,
            "image_url": image_url,
            "feeding_behavior": feeding_text,
            "diet": diet_text,
            "scientific_name": subtitle_text,
            "size": size_text,
            "color": color_text,
            "wing_shape": wing_text,
            "tail_shape": tail_text,
            "migration_text": migration_text,
            "migration_map_url": migration_map_url
        })
    except Exception as e:
        return jsonify({"error": f"Error scraping bird info: {str(e)}"}), 500
    
def adjust_floor(current_thresh, observed_power, alpha=0.9):
    return alpha * current_thresh + (1 - alpha) * observed_power

@app.route('/upload', methods=['POST'])
def upload():
    global NOISE_FLOOR_THRESHOLD, ALPHA

    if 'file' not in request.files:
        return jsonify({"error": "No file found"}), 400

    uploaded_file = request.files['file']
    raw_filename = werkzeug.utils.secure_filename(uploaded_file.filename)
    uploaded_file.save(raw_filename)

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

        # Store to Firestore
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

# Login, Register and Logout Endpoints
@app.route('/register', methods=['POST'])
def register():
    """Register a new user."""
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

        hashed_password = bcrypt.hashpw(
            password.encode('utf-8'), bcrypt.gensalt()
        ).decode('utf-8')

        user = auth.create_user(email=email, password=password)

        user_data = {
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "password": hashed_password,
            "voiceCommandsEnabled": False,
            "locationPreferences": False,
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
    """Register or update a user who signs in with Google."""
    try:
        data = request.json
        email = data.get("email")
        first_name = data.get("firstName", "Google")
        last_name = data.get("lastName", "User")
        uid = data.get("uid")

        if not email or not uid:
            return jsonify({"error": "Missing required fields"}), 400

        # Check if user is in Firestore
        user_query = db.collection("users").where("email", "==", email).stream()
        existing_user = next(user_query, None)

        if existing_user:
            return jsonify({
                "message": "User already exists in Firestore",
                "userId": existing_user.id
            }), 200

        user_data = {
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "uid": uid,
            "password": "Google Account",
            "voiceCommandsEnabled": False,
            "locationPreferences": False,
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        new_user_ref = db.collection("users").add(user_data)

        return jsonify({
            "message": "Google user registered successfully",
            "userId": new_user_ref[1].id
        }), 201

    except Exception as e:
        return jsonify({"error": f"Error registering Google user: {str(e)}"}), 500


@app.route('/login', methods=['POST'])
def login():
    """Authenticate user login."""
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


@app.route('/users/<user_id>/preferences', methods=['PATCH'])
def update_user_preferences(user_id):
    """Update user preferences (voice commands & location)."""
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

@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """
    Fetch the user document for the given user_id.
    Returns the user's data as JSON, or 404 if not found.
    """
    try:
        doc_ref = db.collection("users").document(user_id).get()
        if not doc_ref.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = doc_ref.to_dict()
        return jsonify(user_data), 200
    except Exception as e:
        return jsonify({"error": f"Error fetching user: {str(e)}"}), 500


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


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("Missing OpenAI API Key. Set OPENAI_API_KEY in your environment variables.")

openai.api_key = OPENAI_API_KEY

@app.route('/api/chats/message', methods=['POST'])
def send_message_to_chatgpt():
    """Route to send messages directly to ChatGPT and return a response."""
    try:
        data = request.json
        user_message = data.get("message")

        if not user_message:
            return jsonify({"error": "Message content is required"}), 400

        print(f"Received message: {user_message}")

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": user_message}]
        )

        bot_message = response["choices"][0]["message"]["content"]
        print(f"ChatGPT Response: {bot_message}")

        return jsonify({"botMessage": bot_message})

    except Exception as e:
        print(f"Error calling ChatGPT API: {str(e)}")
        return jsonify({"error": f"Error calling ChatGPT API: {str(e)}"}), 500


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



def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance in KM between two lat/lon points using Haversine.
    We'll convert to miles below if we want that.
    """
    R = 6371.0  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) *
         math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@app.route("/get-hotspot", methods=["GET"])
def get_hotspot():
    bird = request.args.get("bird", "robins")
    month = int(request.args.get("month", 1))

    # optional lat/lon
    user_lat = request.args.get("lat", type=float)
    user_lon = request.args.get("lon", type=float)

    # 1) fetch the single doc
    doc_ref = (
        db.collection("forecasts")
          .document(bird)
          .collection("topHotspots")
          .document(str(month))
          .get()
    )
    if not doc_ref.exists:
        return jsonify({"error": "No precomputed topHotspots for this bird/month"}), 404

    data = doc_ref.to_dict()  

    if "topHotspots" not in data or not data["topHotspots"]:
        return jsonify({"error": "No hotspots found"}), 404

    hotspots = data["topHotspots"]  

    if user_lat is not None and user_lon is not None:
        for h in hotspots:
            dist_km = haversine_distance(user_lat, user_lon, h["lat"], h["lon"])
            dist_mi = dist_km * 0.621371
            h["distance_miles"] = dist_mi

        hotspots.sort(key=lambda x: (x["distance_miles"], -x["reliability_score"]))

        best_hotspot = hotspots[0]
    else:
        hotspots.sort(key=lambda x: x["reliability_score"], reverse=True)
        best_hotspot = hotspots[0]

    return jsonify(best_hotspot), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)