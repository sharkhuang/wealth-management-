#!/bin/bash

# Start Docker services
echo "Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Create Python virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
else
    echo "Python virtual environment already exists"
    cd backend
    source venv/bin/activate
    cd ..
fi

# Initialize S3 bucket
echo "Initializing S3 bucket..."
cd backend
python scripts/init_s3.py
cd ..

# Run database migrations
echo "Running database migrations..."
cd backend
alembic upgrade head
cd ..

# Start backend server
echo "Starting backend server..."
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
cd ..

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Start frontend development server
echo "Starting frontend development server..."
cd frontend
npm run dev 