import numpy as np
import pyaudio
import time
import geocoder
import wave
from birdnetlib import Recording
from birdnetlib.analyzer import Analyzer
from datetime import datetime
import os
import firebase_admin
from pytz import timezone  # Firestore saves timestamps in UTC by default
from firebase_admin import credentials, firestore
from tensorflow.lite.python.interpreter import Interpreter

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Initialize Firebase credentials from environment variables
cred = credentials.Certificate({
    "type": os.getenv("FIREBASE_TYPE"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL"),
})
firebase_admin.initialize_app(cred)

# Initialize Firestore database client
db = firestore.client()

# Audio configuration constants
RATE = 44100  # Sampling rate (samples per second)
CHUNK = 2048  # Number of frames per buffer
FORMAT = pyaudio.paInt16  # Audio format: 16-bit PCM
CHANNELS = 1  # Single audio channel (mono)

# Geolocation setup (get current location using IP)
g = geocoder.ip('me')

# Initialize PyAudio and audio stream
p = pyaudio.PyAudio()
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK)

# Initialize variables for noise floor calculation
window = np.blackman(CHUNK)  # Blackman window for smoothing FFT
noise_floor_samples = []  # To store noise floor audio samples
noise_floor_duration = 10  # Duration to calculate noise floor (in seconds)
noise_floor_threshold = 0  # Noise threshold to filter out background noise
in_max_power = False  # State flag for detecting high power audio signals
full_data = []  # Buffer to store full audio data for saving

# Calculate noise floor over a fixed duration
print("Calculating noise floor for 10 seconds...")
start_time = time.time()
while time.time() - start_time < noise_floor_duration:
    data = stream.read(CHUNK)  # Read audio input in chunks
    audio_data = np.frombuffer(data, dtype=np.int16)
    noise_floor_samples.extend(audio_data)

# Calculate the noise power spectrum and threshold
noise_fft_data = np.fft.fft(noise_floor_samples)
noise_freqs = np.fft.fftfreq(len(noise_floor_samples), 1 / RATE)
noise_power_spectrum = np.abs(noise_fft_data) ** 2
noise_max_power_index = np.argmax(noise_power_spectrum)
noise_max_freq = noise_freqs[noise_max_power_index]
noise_max_power = noise_power_spectrum[noise_max_power_index]
noise_floor_threshold = noise_max_power / 4  # Set noise floor threshold

print(f"Noise floor threshold: {noise_floor_threshold:.2f}")

# File output configuration
output_filename_template = "audio_samples_{count}.wav"
file_count = 0
analyzer = Analyzer()
buffer = 100  # Buffer counter to manage detection timing

# Function to save audio data and analyze it for bird detection
def save_and_analyze(full_data):
    global file_count
    duration = len(full_data) / RATE
    if duration > 3:  # Save only if the audio duration is more than 3 seconds
        print(duration)
        file_count += 1
        output_filename = output_filename_template.format(count=file_count)
        
        # Save audio data to a WAV file
        with wave.open(output_filename, 'wb') as output_wavefile:
            output_wavefile.setnchannels(CHANNELS)
            output_wavefile.setsampwidth(p.get_sample_size(FORMAT))
            output_wavefile.setframerate(RATE)
            output_wavefile.writeframes(full_data.tobytes())
            print(f"Audio samples saved to {output_filename}")

        # Analyze the saved audio file for bird detections
        recording = Recording(
            analyzer,
            output_filename,
            lat=g.latlng[0],
            lon=g.latlng[1],
            date=datetime.now(),
            min_conf=0.25,
        )
        recording.analyze()
        birds = [item['common_name'] for item in recording.detections]
        birds = list(set(birds))  # Remove duplicates
        print(birds)

        # Log detected birds to Firestore
        eastern = timezone('US/Eastern')
        current_time = datetime.now().astimezone(eastern)  # Convert to Eastern Time
        for bird in birds:
            bird_data = {
                "bird": bird,
                "latitude": g.latlng[0],
                "longitude": g.latlng[1],
                "timestamp": current_time
            }
            db.collection("birds").add(bird_data)  # Save to Firestore
            print(f"Logged {bird} to Firestore.")
        
        os.remove(output_filename)  # Delete the temporary audio file

# Main loop to detect audio signals
try:
    while True:
        try:
            data = stream.read(CHUNK, exception_on_overflow=False)  # Read audio chunk
        except OSError as e:
            print(f"Stream read error: {e}")
            continue

        # Process audio data to detect high-power signals
        audio_data = np.frombuffer(data, dtype=np.int16)
        fft_data = np.fft.fft(audio_data * window)
        freqs = np.fft.fftfreq(CHUNK, 1 / RATE)
        power_spectrum = np.abs(fft_data) ** 2

        # Find the frequency with the highest power
        max_power_index = np.argmax(power_spectrum)
        max_freq = freqs[max_power_index]
        max_power = power_spectrum[max_power_index]

        # Check if detected signal exceeds noise threshold
        if ((max_power > noise_floor_threshold) and (max_freq >= 1000 and max_freq <= 8000)) or (buffer < 150):
            if not in_max_power:
                buffer = 0
                in_max_power = True
            if max_power > noise_floor_threshold and (max_freq >= 1000 and max_freq <= 8000):
                buffer = 0
            print(buffer)
            full_data.extend(audio_data)
            buffer += 1
        else:
            in_max_power = False
            if full_data:
                save_and_analyze(np.array(full_data))  # Save and analyze the audio
                full_data = []
            buffer = 100  # Reset buffer


except KeyboardInterrupt:
    print("Recording stopped by user.")

# Stop and close the audio stream
finally:
    stream.stop_stream()
    stream.close()
    p.terminate()
