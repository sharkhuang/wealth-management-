from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from sqlalchemy.orm import Session
from typing import List
import boto3
from botocore.exceptions import ClientError
import uuid
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Document, NetWorthEntry
from app.schemas.schemas import Document as DocumentSchema
from app.tasks.document_tasks import analyze_document

router = APIRouter()

def get_s3_client():
    return boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        endpoint_url=settings.S3_ENDPOINT_URL,
        region_name=settings.AWS_DEFAULT_REGION,
    )

def get_s3_url(s3_client, s3_key: str) -> str:
    try:
        # Instead of using S3 presigned URLs, return a relative URL to our own endpoint
        return f"/api/v1/documents/download/{s3_key}"
    except ClientError as e:
        print(f"Error generating URL: {e}")
        return None

@router.post("/upload", response_model=DocumentSchema)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    s3_client = Depends(get_s3_client)
):
    # Generate unique S3 key
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
    s3_key = f"{uuid.uuid4()}.{file_extension}"

    try:
        # Read file content
        file_content = await file.read()
        
        # Upload file to S3
        s3_client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=s3_key,
            Body=file_content,
            ContentType=file.content_type
        )

        # Create database entry
        document = Document(
            name=file.filename,
            type=file.content_type,
            size=len(file_content),
            s3_key=s3_key,
            analysis_status="pending"
        )
        db.add(document)
        db.commit()
        db.refresh(document)

        try:
            # Trigger async document analysis
            analyze_document.delay(
                document_id=document.id,
                file_content=file_content.decode(),
                file_type=file.content_type
            )
        except Exception as e:
            print(f"Warning: Failed to queue document analysis task: {e}")
            # Don't fail the upload if analysis queuing fails

        # Generate presigned URL
        document_schema = DocumentSchema.from_orm(document)
        document_schema.url = get_s3_url(s3_client, s3_key)
        
        return document_schema

    except Exception as e:
        # Clean up S3 object if operation fails
        try:
            s3_client.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=s3_key)
        except ClientError:
            pass
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=List[DocumentSchema])
def list_documents(
    db: Session = Depends(get_db),
    s3_client = Depends(get_s3_client)
):
    documents = db.query(Document).order_by(Document.created_at.desc()).all()
    # Add presigned URLs to each document
    for doc in documents:
        doc.url = get_s3_url(s3_client, doc.s3_key)
    return documents

@router.get("/{document_id}", response_model=DocumentSchema)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    s3_client = Depends(get_s3_client)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    document.url = get_s3_url(s3_client, document.s3_key)
    return document

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    s3_client = Depends(get_s3_client)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        # Delete from S3
        s3_client.delete_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=document.s3_key
        )
        
        # Delete from database
        db.delete(document)
        db.commit()
        
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add new download endpoint
@router.get("/download/{s3_key}")
async def download_document(
    s3_key: str,
    s3_client = Depends(get_s3_client)
):
    try:
        # Get the object from S3
        response = s3_client.get_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=s3_key
        )
        # Return the file content
        return Response(
            content=response['Body'].read(),
            media_type=response['ContentType']
        )
    except ClientError as e:
        raise HTTPException(status_code=404, detail="File not found") 