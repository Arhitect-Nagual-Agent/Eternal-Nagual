# Nagual Eternal v2 — isolated container (runs next to, but never touching, Voronka)
FROM python:3.12-slim

WORKDIR /app

# git for the local memory cocoon (GitSync); minimal
RUN apt-get update && apt-get install -y --no-install-recommends git openssh-client catdoc djvulibre-bin && rm -rf /var/lib/apt/lists/*

# Deps first for layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App
COPY core.py .
COPY config.env .

# Seed personality — entrypoint copies it into the data volume on first run
COPY data/dna/SOUL.md /app/seed/SOUL.md
COPY entrypoint.sh /app/entrypoint.sh
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
