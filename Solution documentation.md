# Solution Documentation

## Architecture (Hybrid Deployment)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER FLOW                               │
└─────────────────────────────────────────────────────────────────┘

User Browser (Next.js Frontend on Vercel)
        ↓
    POST /api/generate
        ↓
Backend API (Flask on Render) → Queue Task → Redis
        ↓                                      ↑
    Returns task_id                           │
        ↓                                      │
    Polls /api/status/{task_id}               │
        ↓                                      │
Background Worker (RQ on Render) ────────────┘
        │
        ├── LLM API (Path Generation)
        ├── External APIs (Job Market Data)
        └── Stores Result → PostgreSQL
                ↓
        GET /api/result/{task_id}
                ↓
        Display Learning Path on Frontend
```

### Components

- **Frontend**: Next.js (App Router) + TailwindCSS
- **Backend API**: Flask REST API → Deployed on **Render**
- **Worker**: RQ background worker → Deployed on **Render**
- **Queue/Cache**: Redis → Hosted on Redis Cloud
- **Database**: PostgreSQL → Hosted on Render / Supabase
- **AI Services**: Configurable (OpenAI, Groq, Hugging Face)

## Free Deployment Stack

The system is configured to optionally run entirely on free-tier services:

- **LLM/chat/path generation**: Groq via `GROQ_API_KEY`
- **Embeddings**: Hugging Face Inference Providers via `HF_TOKEN`
- **Database**: Supabase Postgres via `SUPABASE_DATABASE_URL`
- **Resource links**: free deterministic search links by default
- **Redis/background worker**: optional, disabled for the free single-service app

### Supabase Notes

Use the Supabase pooled Postgres connection string. If Supabase gives a `postgres://` URL, the application will automatically convert it to a SQLAlchemy-compatible `postgresql://` string.

### Local Testing

For UI-only testing without requiring API keys, set the following environment variables:
```env
DEV_MODE=True
EMBEDDING_PROVIDER=local
```

For real AI testing, set:
```env
DEV_MODE=False
GROQ_API_KEY=your_groq_key
HF_TOKEN=your_huggingface_token
```

## Observability

- **LLM Tracing with LangSmith**: End-to-end tracing of LLM API calls to debug prompts, view outputs, and monitor latency.
- **Metrics Monitoring with Weights & Biases (W&B)**: Logs key performance indicators, including:
  - **Cost Tracking**: Monitor API spending across providers.
  - **Performance**: Track latency and response times.
  - **Token Usage**: Monitor prompt and completion tokens.
