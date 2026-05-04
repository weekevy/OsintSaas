# ~/Desktop/OsintSaas/docker/job-recruitment/Dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/output /app/logs /app/data

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "tools.api_server:app", "--host", "0.0.0.0", "--port", "8000"]