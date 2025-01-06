📚 Robin Backend Setup Guide
###  🐦 1. Prerequisites
- Ensure the following are installed on your machine:
    - Python 3.10+
    - Node.js 14+ 
    - Expo CLI 
    - Firebase Account with a project set up
    - Unsplash Developer Account with an API Key
- 📦 Verify Prerequisites
    - Check Python version
    - python --version

- Check Node.js version
    - node --version
- If Python 3.10 is not installed: Download Python 3.10.

### 🐍 2. Backend Setup
## 📂 2.1 Virtual Environment Setup
- Navigate to the backend folder:
    cd backend
    Create and activate a virtual environment:
    python -m venv venv
- Activate virtual environment
    On Windows: venv\Scripts\activate
    On macOS/Linux: source venv/bin/activate
- Install dependencies:
    pip install -r requirements.txt

## 🔑 2.2 Firebase Environment Variables
🔑 2.2.1 backend/.env
 * Handles Firebase Admin SDK credentials, primarily for server-side operations like Firestore writes and authentication.
- In the backend folder, create a .env file:
    touch .env
    **Add the following variables to .env:**
    FIREBASE_TYPE=service_account
    FIREBASE_PROJECT_ID=
    FIREBASE_PRIVATE_KEY_ID=
    FIREBASE_PRIVATE_KEY=
    FIREBASE_CLIENT_EMAIL=
    FIREBASE_CLIENT_ID=FIREBASE_AUTH_URI=
    FIREBASE_TOKEN_URI=
    FIREBASE_AUTH_PROVIDER_CERT_URL=
    FIREBASE_CLIENT_CERT_URL=

- Replace the above with your actual Firebase credentials from the Firebase Console under Project Settings → Service Account→Generate New private Key

🔑 2.2.2 Frontend/.env
* Manages Firebase Web SDK credentials, primarily for client-side operations like authentication and Firestore querie
- In the root folder, create a .env file:
    touch .env
   **Add the following variables to .env:**
    EXPO_PUBLIC_FIREBASE_API_KEY=
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
    EXPO_PUBLIC_FIREBASE_PROJECT_ID=
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
    EXPO_PUBLIC_FIREBASE_APP_ID=
    EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=

- Replace the above with your actual Firebase credentials from the Firebase Console under Project Settings → General

## ▶️ 2.3 Run Backend Tests
- Run the detection script:
    python detect_birds.py
- If successful:
* Birds heard will be detected.
* Data will be uploaded to Firestore. Firestore Database Tab→ Birds
* Ignore any ffmpeg errors (its for future optimization).

### 💻 3. Frontend Setup
- Navigate to the frontend folder:
    cd frontend

-  Install dependencies:
    npm install

## 🔑 3.1 Environment Variables for Unsplash
- Set up your Unsplash account
- In the same .env folder in your Root folder; 
    **Add the following variable:**
        EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_api_key**

* Replace your_unsplash_api_key with your actual Unsplash API Key.


### 🛠️ 4. Common Commands
*Backend
- Start backend server
python server.py

*Frontend
- Start Expo server
npm start
npm start --clear