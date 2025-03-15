from celery import shared_task
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import Document, NetWorthEntry
from app.services.document_analyzer import DocumentAnalyzer

@shared_task
def analyze_document(document_id: int, file_content: bytes, file_type: str):
    """
    Analyze a document using the document analyzer service and update the net worth table.
    """
    try:
        # Create a new database session
        db = SessionLocal()
        
        # Get the document
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            return {"error": "Document not found"}

        # Initialize the document analyzer
        analyzer = DocumentAnalyzer()
        
        # Analyze the document
        analysis_result = analyzer.analyze_document(file_content, file_type)
        
        # Update document status
        document.analysis_status = "completed"
        document.analysis_result = analysis_result
        
        # If net worth value was found, create a new entry
        if "total_assets" in analysis_result:
            net_worth_entry = NetWorthEntry(
                value=analysis_result["total_assets"],
                date=analysis_result.get("date_of_valuation", None)
            )
            db.add(net_worth_entry)
        
        db.commit()
        return {"status": "success", "analysis_result": analysis_result}
        
    except Exception as e:
        if document:
            document.analysis_status = "failed"
            document.analysis_result = {"error": str(e)}
            db.commit()
        return {"error": str(e)}
        
    finally:
        db.close() 