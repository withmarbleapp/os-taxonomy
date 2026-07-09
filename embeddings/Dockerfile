# embeddings/Dockerfile
# Lean, reproducible image for generating semantic embeddings + UMAP layout + Chroma vector DB
# for the Marble Skill Taxonomy.

FROM python:3.12-slim AS base

# System deps (minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install Python deps (pinned). sentence-transformers pulls torch CPU by default in slim.
# For smaller images in future one could use ONNX, but this is reliable and explicit.
RUN pip install --no-cache-dir -r requirements.txt

# Copy generation code and viz template (the template is source-controlled in embeddings/)
COPY generate.py .
COPY viz.html .

# Default command runs the full pipeline.
# Data is expected at /data (volume), output written to /output (volume)
ENV PYTHONUNBUFFERED=1
ENV EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

CMD ["python", "generate.py", "--data-dir", "/data", "--output-dir", "/output"]
