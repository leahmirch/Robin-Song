import os
import logging
import wave
import numpy as np
from datetime import datetime, timedelta
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
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
import random

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
import math
from functools import wraps
from flask import session, jsonify
from flask_session import Session
from flask import Flask, request

app = Flask(__name__)

app.secret_key = os.getenv("FLASK_SECRET_KEY")

app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_USE_SIGNER"] = True
app.permanent_session_lifetime = timedelta(days=30)


Session(app)

CORS(app, supports_credentials=True)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Not authorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

cred_path = os.getenv("FIREBASE_ADMIN_CREDENTIALS")
if not cred_path or not os.path.isfile(cred_path):
    raise FileNotFoundError(f"Firebase credentials file not found at: {cred_path}")

cred = credentials.Certificate(cred_path)

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

with open(os.path.join(os.path.dirname(__file__), "bird_data.json"), "r", encoding="utf-8") as file:
    bird_data = json.load(file)


def terminate_process_and_children(proc_pid):
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
@login_required
def upload():
    user_id = session["user_id"]
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
                "timestamp": current_time,
                "userId": user_id
            })

        os.remove(wav_filename)
        return jsonify({
            "message": "File processed successfully",
            "birds": birds
        })


@app.route("/my-birds", methods=["GET"])
@login_required
def get_my_bird_history():
    from flask import session
    user_id = session["user_id"]

    user_birds_query = db.collection("birds").where("userId", "==", user_id).stream()

    user_birds = []
    for doc in user_birds_query:
        data = doc.to_dict()
        data["id"] = doc.id
        user_birds.append(data)

    return jsonify(user_birds), 200


@app.route('/start-detection', methods=['POST'])
@login_required
def start_detection():
    print("/start-detection POST request received")
    global is_running, process
    if not is_running:
        try:
            process = subprocess.Popen(["python", "detect_birds.py"], cwd="backend-python")
            is_running = True
            print("Detection started.")
            return jsonify({"message": "Bird detection started"})
        except Exception as e:
            print(f"Error starting detection: {str(e)}")
            return jsonify({"message": f"Error starting detection: {str(e)}"}), 500
    else:
        print('Detection already running.')
        return jsonify({"message": "Bird detection is already running"}), 400

@app.route('/stop-detection', methods=['POST'])
@login_required
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

        avatar_options = [
            "assets/img/blue_jay.png",  
            "assets/img/american_crow.png",  
            "assets/img/canada_goose.png",
            "assets/img/canvasback.png",
            "assets/img/common_grackle.png",
            "assets/img/european_starling.png",
            "assets/img/mallard.png",
            "assets/img/northern_cardinal.png",
            "assets/img/red-winged-blackbird.png",
            "assets/img/ring-billed-gull.png",
            "assets/img/tree-swallow.png",
            "assets/img/turkey_vulture.png",
            "assets/img/american_woodcock.png",
        ]

        selected_avatar = random.choice(avatar_options)
    
        user_data = {
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "password": hashed_password,
            "voiceCommandsEnabled": False,
            "locationPreferences": False,
            "profilePicture": selected_avatar,
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        db.collection("users").document(user.uid).set(user_data)

        return jsonify({"message": "User registered successfully", "userId": user.uid})

    except Exception as e:
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

        avatar_options = [
            "assets/img/blue_jay.png",  
            "assets/img/american_crow.png",  
            "assets/img/canada_goose.png",
            "assets/img/canvasback.png",
            "assets/img/common_grackle.png",
            "assets/img/european_starling.png",
            "assets/img/mallard.png",
            "assets/img/northern_cardinal.png",
            "assets/img/red-winged-blackbird.png",
            "assets/img/ring-billed-gull.png",
            "assets/img/tree-swallow.png",
            "assets/img/turkey_vulture.png",  
            "assets/img/american_woodcock.png",
        ]

        selected_avatar = random.choice(avatar_options)

        user_data = {
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "uid": uid,
            "password": "Google Account",
            "voiceCommandsEnabled": False,
            "locationPreferences": False,            
            "profilePicture": selected_avatar,
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

            session.permanent = True 
            session["user_id"] = user_doc.id
            return jsonify({"message": "Login successful", "userId": user_doc.id})

        else:
            print(f"Login failed: Incorrect password for user {email}")
            return jsonify({"error": "Invalid credentials."}), 401

    except Exception as e:
        print(f"Error logging in: {str(e)}")
        return jsonify({"error": f"Error logging in: {str(e)}"}), 500


@app.route('/logout', methods=['POST'])
def logout():
    from flask import session
    session.pop('user_id', None) 
    return jsonify({"message": "Logout successful"}), 200



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
@login_required
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

@app.route('/users/<user_id>', methods=['GET', 'PATCH'])
@login_required
def handle_user(user_id):
    from flask import session, request

    if user_id != session.get("user_id"):
        return jsonify({"error": "Forbidden"}), 403

    if request.method == 'GET':
        try:
            doc_ref = db.collection("users").document(user_id).get()
            if not doc_ref.exists:
                return jsonify({"error": "User not found"}), 404

            user_data = doc_ref.to_dict()
            return jsonify(user_data), 200
        except Exception as e:
            return jsonify({"error": f"Error fetching user: {str(e)}"}), 500

    elif request.method == 'PATCH':
        data = request.json
        updates = {}

        if "firstName" in data:
            updates["firstName"] = data["firstName"]
        if "lastName" in data:
            updates["lastName"] = data["lastName"]
        if "email" in data:
            try:
                auth.update_user(user_id, email=data["email"])
                updates["email"] = data["email"]
            except Exception as e:
                return jsonify({"error": str(e)}), 400
        if "profilePicture" in data:
            updates["profilePicture"] = data["profilePicture"]

        if updates:
            try:
                db.collection("users").document(user_id).update(updates)
                return jsonify({"message": "Profile updated"}), 200
            except Exception as e:
                return jsonify({"error": f"Failed to update user: {str(e)}"}), 500
        else:
            return jsonify({"message": "No changes provided"}), 400



@app.route("/chats", methods=["POST"])
@login_required
def create_chat():
    try:
        data = request.json
        title = data.get("title", "New Chat")

        user_id = session["user_id"]

        existing_chats = (
            db.collection("chats")
              .where("title", "==", title)
              .where("userId", "==", user_id)
              .stream()
        )
        for c in existing_chats:
            return jsonify({"message": "Chat already exists", "chatId": c.id})

        chat_data = {
            "userId": user_id,
            "title": title,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
        chat_ref = db.collection("chats").add(chat_data)

        return jsonify({"message": "Chat created", "chatId": chat_ref[1].id})

    except Exception as e:
        return jsonify({"error": f"Error creating chat: {str(e)}"}), 500


@app.route("/chats/<chat_id>/message", methods=["POST"])
@login_required
def send_message_to_chat(chat_id):
    """
    Send a user message to ChatGPT and store the conversation.
    """
    try:
        chat_doc = db.collection("chats").document(chat_id).get()
        if not chat_doc.exists:
            return jsonify({"error": "Chat not found"}), 404

        chat_data = chat_doc.to_dict()
        if chat_data.get("userId") != session["user_id"]:
            return jsonify({"error": "Forbidden"}), 403

        data = request.json
        user_message = data["message"]

        messages_ref = db.collection("chats").document(chat_id).collection("messages")
        messages_ref.add({
            "content": user_message,
            "role": "user",
            "sender": session["user_id"],   
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        system_prompt = (
            "You are a birdwatching assistant answering with enthusiasm! You are roleplaying as the bird the user is asking about. "
            "Keep your responses strictly 1-2 sentences long. Be concise but informative. "
            "Do not tell the user that you are roleplaying or that you are pretending to be a bird. "
            "Answer questions that are only related to birds. "
            "If a question is outside bird-related topics, respond politely, mentioning that you only answer bird-related questions."
        )

        example_messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Are you a territorial species?"},
            {"role": "assistant", "content": "Yes, I'm quite territorial! I'll fiercely defend my nesting area and food from other birds or animals who come too close!"},
            {"role": "user", "content": "What does a Robin eat?"},
            {"role": "assistant", "content": "My diet is diverse and includes tasty seeds, nuts, insects, and berries—anything nutritious I can find!"}
        ]

        response = client.chat.completions.create(
            model="gpt-4",
            messages=example_messages + [{"role": "user", "content": user_message}],
            max_tokens=75  
        )
        bot_message = response.choices[0].message.content

        messages_ref.add({
            "content": bot_message,
            "role": "assistant",
            "sender": "AI",
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        return jsonify({"botMessage": bot_message}), 200

    except Exception as e:
        return jsonify({"error": f"Error sending message: {str(e)}"}), 500


@app.route("/chats/<chat_id>/messages", methods=["GET"])
@login_required
def get_chat_messages(chat_id):
    try:
        from flask import session

        chat_doc = db.collection("chats").document(chat_id).get()
        if not chat_doc.exists():
            return jsonify({"error": "Chat not found"}), 404

        if chat_doc.to_dict().get("userId") != session["user_id"]:
            return jsonify({"error": "Forbidden"}), 403

        messages_ref = db.collection("chats").document(chat_id).collection("messages")
        messages_snapshot = messages_ref.order_by("timestamp").stream()
        messages = [{"messageId": msg.id, **msg.to_dict()} for msg in messages_snapshot]

        return jsonify(messages), 200
    except Exception as e:
        return jsonify({"error": f"Error fetching messages: {str(e)}"}), 500


@app.route("/chats", methods=["GET"])
@login_required
def get_all_chats():
    try:
        from flask import session
        user_id = session["user_id"]

        chats_ref = db.collection("chats").where("userId", "==", user_id).stream()
        chat_list = [{"chatId": c.id, **c.to_dict()} for c in chats_ref]

        return jsonify(chat_list)
    except Exception as e:
        return jsonify({"error": f"Error fetching chats: {str(e)}"}), 500


@app.route("/chats/<chat_id>", methods=["DELETE"])
@login_required
def delete_chat(chat_id):
    """Delete a chat thread and its messages."""
    try:
        from flask import session
        chat_doc = db.collection("chats").document(chat_id).get()
        if not chat_doc.exists:
            return jsonify({"error": "Chat not found"}), 404

        if chat_doc.to_dict().get("userId") != session["user_id"]:
            return jsonify({"error": "Forbidden"}), 403

        messages_ref = db.collection("chats").document(chat_id).collection("messages")
        for msg in messages_ref.stream():
            msg.reference.delete()

        db.collection("chats").document(chat_id).delete()
        return jsonify({"message": "Chat deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Error deleting chat: {str(e)}"}), 500


@app.route("/chats/<chat_id>/messages/<message_id>", methods=["DELETE"])
@login_required
def delete_message(chat_id, message_id):
    try:
        from flask import session
        chat_doc = db.collection("chats").document(chat_id).get()
        if not chat_doc.exists:
            return jsonify({"error": "Chat not found"}), 404

        if chat_doc.to_dict().get("userId") != session["user_id"]:
            return jsonify({"error": "Forbidden"}), 403

        db.collection("chats").document(chat_id).collection("messages").document(message_id).delete()
        return jsonify({"message": "Message deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Error deleting message: {str(e)}"}), 500


@app.route("/bird-questions", methods=["GET"])
@login_required
def get_bird_questions():
    """Return a set of random bird-related questions for chat suggestions."""
    try:
        bird_questions = [
            "What does a robin eat?",
            "Where do robins build their nests?",
            "How long do robins live?",
            "Why do robins have red chests?",
            "Do robins migrate in winter?",
            "When do robins lay eggs?",
            "How can I attract robins to my garden?",
            "What sound does a robin make?",
            "Are robins territorial birds?",
            "How do robins find worms?",
            "What predators do robins have?",
            "Do male and female robins look different?",
            "How many eggs do robins typically lay?",
            "Do robins return to the same nest?",
            "What birds stay active during winter?",
            "How do birds navigate during migration?",
            "What's the fastest flying bird?",
            "How do birds sleep?",
            "Why do birds sing in the morning?",
            "How do birds stay warm in winter?",
            "What's the difference between a hawk and a falcon?",
            "How do hummingbirds hover?",
            "Which birds are the best mimics?",
            "What should I feed wild birds in my backyard?",
            "How do birds communicate with each other?",
            "What's the smartest bird species?",
            "How do birds find their way home?",
            "Why do birds flock together?",
            "How do birds stay cool in summer?"
        ]

        import random
        selected_questions = random.sample(bird_questions, 4)

        return jsonify({"questions": selected_questions})
    except Exception as e:
        return jsonify({"error": f"Error fetching bird questions: {str(e)}"}), 500




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
@login_required
def get_hotspot():
    bird = request.args.get("bird", "robins")
    month = int(request.args.get("month", 1))

    user_lat = request.args.get("lat", type=float)
    user_lon = request.args.get("lon", type=float)

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




@app.route('/users/<user_id>/password', methods=['PATCH'])
@login_required
def change_password(user_id):
    if user_id != session["user_id"]:
        return jsonify({"error": "Forbidden"}), 403
    new_password = request.json.get("password")
    if not new_password:
        return jsonify({"error": "Password required"}), 400
    try:
        auth.update_user(user_id, password=new_password)
        db.collection("users").document(user_id).update({"password": bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()})
        return jsonify({"message": "Password updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/users/<user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):
    if user_id != session["user_id"]:
        return jsonify({"error": "Forbidden"}), 403
    try:
        auth.delete_user(user_id)
        db.collection("users").document(user_id).delete()
        session.pop("user_id", None)
        return jsonify({"message": "Account deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/users/me', methods=['GET'])
@login_required
def get_my_user():
    from flask import session
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "No user_id in session"}), 401

    doc_ref = db.collection("users").document(user_id).get()
    if not doc_ref.exists:
        return jsonify({"error": "User not found"}), 404

    user_data = doc_ref.to_dict()
    user_data['id'] = doc_ref.id  
    return jsonify(user_data), 200





if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)