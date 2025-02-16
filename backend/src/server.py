from flask import Flask, jsonify, request
import subprocess
import psutil
import os
import signal
from firebase_admin import credentials, firestore, initialize_app
import bcrypt
import firebase_admin
from firebase_admin import auth
from flask_cors import CORS
import json
from bs4 import BeautifulSoup
import requests

app = Flask(__name__)
CORS(app)

cred = credentials.Certificate(os.path.join(os.getcwd(), "backend/secrets/firebase-admin-key.json"))
initialize_app(cred)
db = firestore.client()

is_running = False
process = None  

# Load bird data from JSON file
with open("bird_data.json", "r", encoding="utf-8") as file:
    bird_data = json.load(file)

def terminate_process_and_children(proc_pid):
    try:
        parent = psutil.Process(proc_pid)
        for child in parent.children(recursive=True):
            child.terminate()
        parent.terminate()
    except psutil.NoSuchProcess:
        pass

# Bird Information Endpoints
@app.route('/bird-info', methods=['GET'])
def get_bird_info():
    bird_name = request.args.get('bird')
    if not bird_name:
        return jsonify({"error": "Bird name is required"}), 400

    # Fetch the bird's URL from bird_data.json
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
        # Fetch the Audubon page
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        soup = BeautifulSoup(response.content, "html.parser")

        # Extract the description
        description = soup.find("div", class_="bird_info_item info_description")
        description_text = description.find("div", class_="content").text.strip() if description else "No description available."

        # Extract At a Glance
        at_a_glance = soup.find("h2", id="at_a_glance")
        at_a_glance_text = at_a_glance.find_next("div", class_="intro_text").text.strip() if at_a_glance else "No 'At a Glance' information available."

        # Extract Habitat
        habitat = soup.find("div", class_="bird_info_item info_habitat")
        habitat_text = habitat.find("div", class_="content").text.strip() if habitat else "No habitat information available."

        # Extract the image URL
        media_data = soup.find("div", class_="media-data")
        image_url = None

        if media_data:
            picture_tag = media_data.find("picture")
            if picture_tag:
                img_tag = picture_tag.find("img")
                if img_tag and "data-srcset" in img_tag.attrs:
                    # Extract the first image URL from the srcset
                    image_url = img_tag["data-srcset"].split(" ")[0]
                elif img_tag and "src" in img_tag.attrs:
                    image_url = img_tag["src"]
                else:
                    source_tag = picture_tag.find("source")
                    if source_tag and "data-srcset" in source_tag.attrs:
                        image_url = source_tag["data-srcset"].split(" ")[0]
                    elif source_tag and "srcset" in source_tag.attrs:
                        image_url = source_tag["srcset"].split(" ")[0]

        # Debug log
        print("Scraped Image URL:", image_url)

        return jsonify({
            "description": description_text,
            "at_a_glance": at_a_glance_text,
            "habitat": habitat_text,
            "image_url": image_url, 
        })
    except requests.RequestException as e:
        print(f"Error fetching URL: {e}")
        return jsonify({"error": f"Error fetching URL: {str(e)}"}), 500
    except Exception as e:
        print(f"Error scraping bird info: {e}")
        print(f"HTML content: {soup.prettify() if 'soup' in locals() else 'No HTML content available.'}")
        return jsonify({"error": f"Error scraping bird info: {str(e)}"}), 500

# Detected Bird Endpoint
@app.route('/detected-bird', methods=['POST'])
def handle_detected_bird():
    data = request.json
    bird_name = data.get("bird")
    if not bird_name:
        return jsonify({"error": "Bird name is required"}), 400
    
    # Store the detected bird in Firestore
    db.collection("birds").add({
        "bird": bird_name,
        "timestamp": firestore.SERVER_TIMESTAMP
    })
    
    return jsonify({"message": "Bird detected and stored successfully"}), 200

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
    """Register or update a user who signs in with Google."""
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