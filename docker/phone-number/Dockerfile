FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV TZ=UTC

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    git \
    curl \
    wget \
    nmap \
    whois \
    dnsutils \
    net-tools \
    iputils-ping \
    traceroute \
    jq \
    vim \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Create symbolic link for python
RUN ln -s /usr/bin/python3 /usr/bin/python

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Install additional Python tools
RUN pip3 install --no-cache-dir \
    shodan \
    censys \
    virustotal-api \
    python-whois \
    dnspython \
    requests \
    beautifulsoup4 \
    selenium \
    pandas \
    numpy \
    fastapi \
    uvicorn \
    pydantic \
    python-multipart \
    aiohttp \
    asyncio \
    colorama \
    tqdm \
    python-dotenv \
    pymysql \
    sqlalchemy

# Copy application files
COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Create directories for output
RUN mkdir -p /app/output /app/logs /app/data

# Set entrypoint
ENTRYPOINT ["./entrypoint.sh"]

# Default command
CMD ["bash"]
