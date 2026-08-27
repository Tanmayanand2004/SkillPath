"""
Direct OpenAI-compatible chat API handler.

Groq supports the OpenAI chat-completions shape at
https://api.groq.com/openai/v1, so the rest of the app can keep using one
small helper while running on a free Groq key.
"""
import os
import json
import requests
from typing import Dict, Any, List, Optional
from langsmith import traceable as langsmith_traceable

@langsmith_traceable(name="OpenAI_Compatible_Direct_Call")
def generate_completion(
    prompt: str,
    system_message: str = "You are an expert educational AI assistant that specializes in creating personalized learning paths.",
    model: str = None,
    temperature: float = 0.7,
    max_tokens: int = 1000,
    timeout: int = 120
) -> str:
    """
    Generate a completion using direct HTTP requests to OpenAI API.
    
    Args:
        prompt: The user prompt
        system_message: Optional system message
        model: The OpenAI-compatible model to use
        temperature: Sampling temperature
        max_tokens: Maximum tokens to generate
        
    Returns:
        The generated text
    """
    provider = os.environ.get("DEFAULT_PROVIDER", "groq").lower()
    default_model = "openai/gpt-oss-20b" if provider == "groq" else "gpt-4o-mini"
    model = model or os.environ.get("DEFAULT_MODEL", default_model)

    # Get API key from environment or directly from file if needed
    api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("OPENAI_API_KEY")
    
    # Fallback to direct read if environment variable isn't working
    if not api_key or len(api_key) < 20:
        try:
            with open('.env', 'r') as f:
                for line in f:
                    if line.startswith('GROQ_API_KEY=') or line.startswith('OPENAI_API_KEY='):
                        api_key = line.strip().split('=', 1)[1]
                        break
        except Exception as e:
            print(f"Error reading API key from file: {e}")
    
    if not api_key:
        raise ValueError("API key not found. Set GROQ_API_KEY for free Groq inference.")
        
    print("Using configured OpenAI-compatible API key: SET")
    
    # API endpoint
    default_base_url = "https://api.groq.com/openai/v1" if provider == "groq" else "https://api.openai.com/v1"
    base_url = os.environ.get("OPENAI_BASE_URL", default_base_url).rstrip("/")
    url = f"{base_url}/chat/completions"
    
    # Request headers
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    # Request payload
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    
    print(f"Making direct API request to {base_url} with model {model}...")
    
    # Make the request
    try:
        response = requests.post(
            url, 
            headers=headers,
            json=payload,
            timeout=timeout
        )
        
        # Check if request was successful
        response.raise_for_status()
        
        # Parse response
        result = response.json()
        print("Received response from OpenAI-compatible API")
        
        # Extract and return the generated text
        if "choices" in result and len(result["choices"]) > 0:
            return result["choices"][0]["message"]["content"]
        else:
            raise ValueError(f"Unexpected API response: {json.dumps(result)}")
            
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {str(e)}")
        if hasattr(e, "response") and e.response is not None:
            status_code = e.response.status_code
            try:
                error_data = e.response.json()
                provider_code = error_data.get("error", {}).get("code") or error_data.get("error", {}).get("type") or "provider_error"
                error_message = f"status {status_code}: {provider_code}"
            except:
                error_message = f"status {status_code}"
        else:
            error_message = str(e)
            
        raise ValueError(f"OpenAI-compatible API request failed: {error_message}")
