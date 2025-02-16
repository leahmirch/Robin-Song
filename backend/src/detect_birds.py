import numpy as np
import pyaudio
import time
import geocoder
import wave
from birdnetlib import Recording
from birdnetlib.analyzer import Analyzer
from datetime import datetime
import os
import sys
import firebase_admin
from pytz import timezone 
from firebase_admin import credentials, firestore
from tensorflow.lite.python.interpreter import Interpreter
import logging
import requests  # Added for sending bird data to backend

sys.stdout = open(os.devnull, 'w')
sys.stderr = open(os.devnull, 'w')

logging.getLogger("birdnetlib").setLevel(logging.ERROR)
logging.getLogger("tensorflow").setLevel(logging.ERROR)
logging.getLogger("pyaudio").setLevel(logging.ERROR)

from dotenv import load_dotenv
load_dotenv()

SERVICE_ACCOUNT_FILE = "C:\\Users\\janai\\OneDrive\\Desktop\\Robin-Song-1\\backend\\secrets\\firebase-admin-key.json"

cred = credentials.Certificate(SERVICE_ACCOUNT_FILE)
firebase_admin.initialize_app(cred)

db = firestore.client()

RATE = 44100 
CHUNK = 2048  
FORMAT = pyaudio.paInt16  
CHANNELS = 1 

g = geocoder.ip('me')

p = pyaudio.PyAudio()
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK)

window = np.blackman(CHUNK)  
noise_floor_samples = []  
noise_floor_duration = 10  
noise_floor_threshold = 0 
in_max_power = False  
full_data = [] 

start_time = time.time()
while time.time() - start_time < noise_floor_duration:
    data = stream.read(CHUNK)  
    audio_data = np.frombuffer(data, dtype=np.int16)
    noise_floor_samples.extend(audio_data)

noise_fft_data = np.fft.fft(noise_floor_samples)
noise_freqs = np.fft.fftfreq(len(noise_floor_samples), 1 / RATE)
noise_power_spectrum = np.abs(noise_fft_data) ** 2
noise_max_power_index = np.argmax(noise_power_spectrum)
noise_max_freq = noise_freqs[noise_max_power_index]
noise_max_power = noise_power_spectrum[noise_max_power_index]
noise_floor_threshold = noise_max_power / 4  

output_filename_template = "audio_samples_{count}.wav"
file_count = 0
analyzer = Analyzer()
analyzer.verbose = False 
buffer = 100  

def send_bird_to_backend(bird_name):
    """Send the detected bird name to the backend."""
    try:
        response = requests.post(
            "http://127.0.0.1:5000/detected-bird",
            json={"bird": bird_name}
        )
        if response.status_code == 200:
            print(f"Successfully sent {bird_name} to backend.")
        else:
            print(f"Failed to send {bird_name} to backend. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error sending {bird_name} to backend: {e}")

def save_and_analyze(full_data):
    global file_count
    duration = len(full_data) / RATE
    if duration > 3:  
        file_count += 1
        output_filename = output_filename_template.format(count=file_count)
        
        with wave.open(output_filename, 'wb') as output_wavefile:
            output_wavefile.setnchannels(CHANNELS)
            output_wavefile.setsampwidth(p.get_sample_size(FORMAT))
            output_wavefile.setframerate(RATE)
            output_wavefile.writeframes(full_data.tobytes())

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
        birds = list(set(birds)) 

        eastern = timezone('US/Eastern')
        current_time = datetime.now().astimezone(eastern) 
        for bird in birds:
            # Send the detected bird to the backend
            send_bird_to_backend(bird)

            # Save the bird data to Firestore
            bird_data = {
                "bird": bird,
                "latitude": g.latlng[0],
                "longitude": g.latlng[1],
                "timestamp": current_time
            }
            db.collection("birds").add(bird_data)  
        
        os.remove(output_filename) 

try:
    while True:
        try:
            data = stream.read(CHUNK, exception_on_overflow=False) 
        except OSError as e:
            continue

        audio_data = np.frombuffer(data, dtype=np.int16)
        fft_data = np.fft.fft(audio_data * window)
        freqs = np.fft.fftfreq(CHUNK, 1 / RATE)
        power_spectrum = np.abs(fft_data) ** 2

        max_power_index = np.argmax(power_spectrum)
        max_freq = freqs[max_power_index]
        max_power = power_spectrum[max_power_index]

        if ((max_power > noise_floor_threshold) and (max_freq >= 1000 and max_freq <= 8000)) or (buffer < 150):
            if not in_max_power:
                buffer = 0
                in_max_power = True
            if max_power > noise_floor_threshold and (max_freq >= 1000 and max_freq <= 8000):
                buffer = 0
            full_data.extend(audio_data)
            buffer += 1
        else:
            in_max_power = False
            if full_data:
                save_and_analyze(np.array(full_data)) 
                full_data = []
            buffer = 100 

except KeyboardInterrupt:
    print("Recording stopped by user.")

finally:
    stream.stop_stream()
    stream.close()
    p.terminate()