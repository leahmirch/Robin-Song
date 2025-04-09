FROM ubuntu:latest

# Set non-interactive mode for APT
ENV DEBIAN_FRONTEND=noninteractive

# Install necessary dependencies
RUN apt-get update && apt-get install -y \
    software-properties-common \
    && add-apt-repository -y ppa:deadsnakes/ppa && apt-get update && apt-get install -y \
    build-essential \
    libasound2-dev \
    portaudio19-dev \
    wget \
    curl \
    ffmpeg \
    python3.11 \
    python3.11-dev \
    && apt-get clean

# Install pip independently to avoid conflicts
RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.11
RUN apt-get update && apt-get install -y alsa-utils


# Install Python dependencies
ADD backend-python/requirements.txt requirements.txt
RUN python3.11 -m pip install --no-cache-dir --ignore-installed -r requirements.txt

# Copy the rest of the application files
ADD backend-python/detect_birds.py .
ADD backend-python/bird_data.csv .


# Expose the application port
EXPOSE 5000

# Set the default command
CMD ["python3.11", "./backend-python/detect_birds.py"]
