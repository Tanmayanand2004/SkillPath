import json
import uuid
from typing import List, Dict, Any
import numpy as np
from supabase import create_client, Client
from pydantic import BaseModel

from src.utils.llm_client import get_llm_client
from config import Config

class ResourceDocument(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]
    similarity: float = 0.0

class RAGPipeline:
    def __init__(self):
        # Initialize Supabase client
        supabase_url = Config.SUPABASE_URL
        supabase_key = Config.SUPABASE_KEY
        
        if not supabase_url or not supabase_key:
            self.supabase = None
            print("Warning: Supabase credentials missing. RAG pipeline will be disabled.")
        else:
            self.supabase: Client = create_client(supabase_url, supabase_key)
            
        self.llm_client = get_llm_client()

    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI's text-embedding-3-small."""
        try:
            response = self.llm_client.embeddings.create(
                model="text-embedding-3-small",
                input=text,
                encoding_format="float"
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Embedding generation error: {e}")
            # Fallback to random if no API key for testing
            return np.random.rand(1536).tolist()

    def retrieve_resources(self, query: str, limit: int = 3, threshold: float = 0.6) -> List[ResourceDocument]:
        """Search Supabase pgvector for similar verified courses."""
        if not self.supabase:
            return []

        embedding = self.generate_embedding(query)
        
        try:
            # Call the match_documents function we created via MCP
            response = self.supabase.rpc(
                'match_documents',
                {
                    'query_embedding': embedding,
                    'match_threshold': threshold,
                    'match_count': limit
                }
            ).execute()
            
            docs = []
            for item in response.data:
                docs.append(ResourceDocument(
                    id=item['id'],
                    content=item['content'],
                    metadata=item['metadata'],
                    similarity=item['similarity']
                ))
            return docs
        except Exception as e:
            print(f"Supabase RAG search error: {e}")
            return []

    def validate_and_enrich_resource(self, topic: str, target_skill: str) -> Dict[str, str]:
        """
        Uses RAG to find a verified resource for a given skill.
        If found, returns the verified URL and description.
        If not, falls back to a generic search string.
        """
        query = f"Course or tutorial for {topic} focusing on {target_skill}"
        docs = self.retrieve_resources(query, limit=1, threshold=0.5)
        
        if docs:
            best_match = docs[0]
            url = best_match.metadata.get('url', f"https://www.google.com/search?q={query.replace(' ', '+')}")
            return {
                "url": url,
                "description": best_match.content[:100] + "...",
                "type": best_match.metadata.get('type', 'course')
            }
        
        # Fallback if no matching verified resource is in the database
        return {
            "url": f"https://www.google.com/search?q={query.replace(' ', '+')}",
            "description": f"Search for {target_skill} resources",
            "type": "search"
        }

# Singleton instance
rag_pipeline = RAGPipeline()
