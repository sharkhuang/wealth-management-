import boto3
import os
import sys

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

def init_s3():
    print("Initializing S3 bucket...")
    
    # Initialize S3 client
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        endpoint_url=settings.S3_ENDPOINT_URL,
        region_name=settings.AWS_DEFAULT_REGION,
    )

    try:
        # Create bucket if it doesn't exist
        try:
            s3_client.head_bucket(Bucket=settings.S3_BUCKET_NAME)
            print(f"Bucket {settings.S3_BUCKET_NAME} already exists")
        except:
            s3_client.create_bucket(Bucket=settings.S3_BUCKET_NAME)
            print(f"Created bucket {settings.S3_BUCKET_NAME}")

        # Configure CORS for the bucket
        cors_configuration = {
            'CORSRules': [{
                'AllowedHeaders': ['*'],
                'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE'],
                'AllowedOrigins': ['http://localhost:3000'],  # Frontend URL
                'ExposeHeaders': ['ETag'],
                'MaxAgeSeconds': 3000
            }]
        }
        
        s3_client.put_bucket_cors(
            Bucket=settings.S3_BUCKET_NAME,
            CORSConfiguration=cors_configuration
        )
        print("Configured CORS for the bucket")

    except Exception as e:
        print(f"Error initializing S3: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    init_s3() 