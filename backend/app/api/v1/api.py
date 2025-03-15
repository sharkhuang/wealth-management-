from fastapi import APIRouter
from app.api.v1.endpoints import net_worth, documents

api_router = APIRouter()

api_router.include_router(net_worth.router, prefix="/net-worth", tags=["net-worth"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"]) 