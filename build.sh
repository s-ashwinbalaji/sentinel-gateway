#!/bin/bash
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ../backend
echo "Installing backend dependencies..."
pip install -r requirements.txt
