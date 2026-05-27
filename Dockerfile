FROM python:3.11-slim

RUN apt-get update && apt-get install -y bash git && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp/build

RUN git clone --branch v0.3.1 --depth 1 https://github.com/accumulator/charge-lnd.git .

RUN pip install --no-cache-dir -r requirements.txt .

RUN rm -rf /tmp/build

WORKDIR /root