"""OpenAI-compatible LLM client helpers.

The app can use paid OpenAI or free-tier Groq without changing every call site.
Set GROQ_API_KEY for Groq, or OPENAI_API_KEY for OpenAI.
"""

import os
from typing import Any, Dict, List, Optional

from openai import OpenAI


def get_llm_provider() -> str:
    return os.getenv("DEFAULT_PROVIDER", "groq" if os.getenv("GROQ_API_KEY") else "openai").lower()


def get_llm_api_key() -> Optional[str]:
    return os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")


def get_llm_base_url() -> Optional[str]:
    explicit_base_url = os.getenv("OPENAI_BASE_URL")
    if explicit_base_url:
        return explicit_base_url.rstrip("/")
    if get_llm_provider() == "groq":
        return "https://api.groq.com/openai/v1"
    return None


def get_llm_model(default: Optional[str] = None) -> str:
    provider = get_llm_provider()
    fallback = "openai/gpt-oss-20b" if provider == "groq" else "gpt-4o-mini"
    return os.getenv("DEFAULT_MODEL", default or fallback)


def get_llm_client() -> OpenAI:
    api_key = get_llm_api_key()
    if not api_key:
        raise ValueError("API key not found. Set GROQ_API_KEY for free Groq inference.")

    kwargs: Dict[str, Any] = {"api_key": api_key}
    base_url = get_llm_base_url()
    if base_url:
        kwargs["base_url"] = base_url
    return OpenAI(**kwargs)


def chat_completion_content(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 500,
    timeout: Optional[int] = None,
) -> str:
    completion = get_llm_client().chat.completions.create(
        model=model or get_llm_model(),
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
        timeout=timeout,
    )
    return completion.choices[0].message.content.strip()
