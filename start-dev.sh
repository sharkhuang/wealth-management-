#!/bin/bash

# Stop any running containers
docker-compose down

# Start all services
docker-compose up --build -d

# Initialize S3 bucket
echo "Initializing S3 bucket..."
cd backend && python init_s3.py
cd ..

# Show logs
docker-compose logs -f 