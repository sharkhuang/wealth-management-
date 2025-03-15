# Wealth Management Platform

A scalable and reliable wealth management platform built with Next.js and FastAPI.

## Features

- Net worth tracking with interactive graphs
- Document management (upload, browse, download)
- Real-time data updates

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- TailwindCSS
- Chart.js for visualizations
- React Query for data fetching

### Backend
- FastAPI (Python)
- SQLAlchemy for ORM
- Pydantic for data validation
- LocalStack for S3 simulation

### Infrastructure
- Docker & Docker Compose
- PostgreSQL for data persistence
- Redis for caching
- AWS S3 (LocalStack) for document storage

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   # Frontend
   cd frontend
   npm install
   ```

3. Start the development environment:
   ```bash
   docker-compose up -d
   ```

4. Run the applications:
   ```bash
   # Backend
   cd backend
   uvicorn main:app --reload

   # Frontend
   cd frontend
   npm run dev
   ```

## Architecture

The application follows a microservices architecture for scalability:

- Frontend: Next.js SSR application
- Backend API: FastAPI service
- Document Service: S3-compatible storage
- Cache Layer: Redis
- Database: PostgreSQL

## Performance & Reliability

- Designed to handle 10k+ requests per second
- 99.99% uptime target
- Comprehensive error handling and logging
- Caching strategy for improved performance
- Rate limiting and security measures

## Development Guidelines

- Follow TypeScript strict mode
- Use Python type hints
- Write unit tests for all new features
- Follow Git flow branching model
- Document all API endpoints using OpenAPI 
