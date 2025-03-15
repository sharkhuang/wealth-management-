from typing import Dict, Optional, List
import openai
import json
from datetime import datetime
from app.core.config import settings

class DocumentAnalyzer:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY

    async def analyze_document(self, content: bytes, file_type: str) -> Optional[Dict]:
        """
        Analyze document content and extract financial information.
        Returns a dictionary containing structured financial data.
        """
        try:
            # Convert document content to text
            text_content = content.decode('utf-8')

            # Create analysis prompt with JSON structure
            prompt = f"""
            Analyze this financial document and extract the information in the following JSON structure:
            {{
                "total_assets": float,  # Total value of all assets
                "valuation_date": "YYYY-MM-DD",  # Date of valuation
                "assets": [
                    {{
                        "type": str,  # Type of asset (e.g., "Real Estate", "Stocks", "Cash")
                        "value": float,  # Value of this asset type
                        "description": str  # Brief description
                    }}
                ],
                "liabilities": [
                    {{
                        "type": str,  # Type of liability (e.g., "Mortgage", "Credit Card")
                        "value": float,  # Value of this liability
                        "description": str  # Brief description
                    }}
                ],
                "net_worth": float  # Total assets minus total liabilities
            }}

            Ensure all numerical values are formatted as plain numbers without currency symbols.
            Format dates as YYYY-MM-DD.
            If a field cannot be determined, use null.

            Document content:
            {text_content[:4000]}
            """

            # Call OpenAI API
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a financial document analyzer. Extract and structure financial data in JSON format. Be precise with numerical values and dates."},
                    {"role": "user", "content": prompt}
                ]
            )

            # Parse the response
            analysis_text = response.choices[0].message.content

            # Extract JSON from the response
            try:
                # Find JSON content (in case there's additional text)
                json_start = analysis_text.find('{')
                json_end = analysis_text.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_content = analysis_text[json_start:json_end]
                    analysis_data = json.loads(json_content)

                    # Validate and clean the data
                    cleaned_data = {
                        "total_value": float(analysis_data.get("total_assets", 0)),
                        "date": datetime.strptime(
                            analysis_data.get("valuation_date", datetime.now().strftime("%Y-%m-%d")),
                            "%Y-%m-%d"
                        ),
                        "source_document": file_type,
                        "raw_analysis": analysis_data,
                        "assets": analysis_data.get("assets", []),
                        "liabilities": analysis_data.get("liabilities", []),
                        "net_worth": float(analysis_data.get("net_worth", 0))
                    }
                    return cleaned_data

            except (json.JSONDecodeError, ValueError) as e:
                print(f"Error parsing analysis response: {str(e)}")
                return None

        except Exception as e:
            print(f"Error analyzing document: {str(e)}")
            return None

        return None 