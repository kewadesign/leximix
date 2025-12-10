#!/bin/bash

# Deployment Wrapper Script

echo "============================================"
echo "      LEXIMIX BUILD & DEPLOYMENT SYSTEM     "
echo "============================================"

# Ensure we have access to npm/node
# Try to source common rc files if available
if [ -f "$HOME/.zshrc" ]; then
    source "$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    source "$HOME/.bashrc"
fi

# Check requirements
if ! command -v npm &> /dev/null; then
    echo "Error: npm could not be found. Please ensure Node.js is installed."
    exit 1
fi

# Setup Java
export JAVA_HOME="/opt/homebrew/opt/openjdk@21"
export PATH="$JAVA_HOME/bin:$PATH"

# Setup Android
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

if ! command -v java &> /dev/null; then
    echo "Error: Java could not be found. Please ensure OpenJDK is installed."
    exit 1
fi

echo "--- Step 1: Installing Dependencies ---"
npm install
if [ $? -ne 0 ]; then
    echo "npm install failed."
    exit 1
fi

echo "--- Step 2: Building Web App ---"
npm run build
if [ $? -ne 0 ]; then
    echo "Web build failed."
    exit 1
fi

echo "--- Step 3: Building Android APK ---"
npx cap sync android
cd android
./gradlew assembleDebug
if [ $? -ne 0 ]; then
    echo "Android build failed."
    cd ..
    exit 1
fi
cd ..

echo "--- Step 4: Packaging & Uploading ---"
# Check if venv python exists, else assume system python
if [ -f "./venv/bin/python" ]; then
    ./venv/bin/python package_and_upload.py
else
    # Try creating venv if missing or use system
    echo "Virtual env not found, attempting to create..."
    python3 -m venv venv
    ./venv/bin/pip install paramiko
    ./venv/bin/python package_and_upload.py
fi

echo "============================================"
echo "          DEPLOYMENT FINISHED               "
echo "============================================"
