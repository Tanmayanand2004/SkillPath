"""
URL Validation module for SkillPath.
Validates resource URLs after AI generation to prevent hallucination.
"""
import requests
from typing import List, Dict, Any
from urllib.parse import quote_plus
import concurrent.futures


def validate_url(url: str, timeout: int = 3) -> bool:
    """Check if a URL is reachable."""
    if not url or url == "#" or url.startswith("https://example.com"):
        return False
    try:
        r = requests.head(url, timeout=timeout, allow_redirects=True,
                          headers={"User-Agent": "Mozilla/5.0 SkillPath/1.0"})
        return r.status_code < 400
    except Exception:
        return False


def make_fallback_url(title: str, topic: str) -> str:
    """Create a guaranteed-working Google search URL as a fallback."""
    query = quote_plus(f"{title} {topic} tutorial course")
    return f"https://www.google.com/search?q={query}"


def validate_and_fix_resources(milestones: List[Dict[str, Any]], topic: str) -> List[Dict[str, Any]]:
    """
    Validate all resource URLs in milestones and replace broken ones with
    guaranteed working Google search fallbacks.

    This is the anti-hallucination layer that ensures 100% of links work.
    """
    # Collect all URLs to validate
    url_jobs = []
    for m_idx, milestone in enumerate(milestones):
        for r_idx, resource in enumerate(milestone.get("resources", [])):
            url = resource.get("url", "")
            desc = resource.get("description", resource.get("title", "Resource"))
            url_jobs.append((m_idx, r_idx, url, desc))

    if not url_jobs:
        return milestones

    # Validate URLs concurrently (max 8 threads, 3s timeout each)
    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        future_to_job = {
            executor.submit(validate_url, url): (m_idx, r_idx, url, desc)
            for m_idx, r_idx, url, desc in url_jobs
        }
        for future in concurrent.futures.as_completed(future_to_job):
            m_idx, r_idx, url, desc = future_to_job[future]
            is_valid = future.result()
            results[(m_idx, r_idx)] = (is_valid, url, desc)

    # Apply fixes
    fixed_milestones = [dict(m) for m in milestones]
    fixed_count = 0
    for (m_idx, r_idx), (is_valid, url, desc) in results.items():
        if not is_valid:
            fallback_url = make_fallback_url(desc, topic)
            fixed_milestones[m_idx]["resources"][r_idx]["url"] = fallback_url
            fixed_milestones[m_idx]["resources"][r_idx]["url_validated"] = False
            fixed_count += 1
        else:
            fixed_milestones[m_idx]["resources"][r_idx]["url_validated"] = True

    print(f"✅ URL Validation: {len(url_jobs) - fixed_count}/{len(url_jobs)} valid. Fixed {fixed_count} broken links.")
    return fixed_milestones
