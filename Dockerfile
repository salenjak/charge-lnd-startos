FROM python:3.11-slim

# bash is needed for the daemon loop, git is needed to clone the repo
RUN apt-get update && apt-get install -y bash git && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp/build

# Clone the exact upstream tag from GitHub (charge-lnd is NOT on PyPI)
RUN git clone --branch v0.3.1 --depth 1 https://github.com/accumulator/charge-lnd.git .

# Install the package globally using the upstream developer's method
RUN pip install --no-cache-dir -r requirements.txt .

# Clean up the source code to keep the final image small and secure
RUN rm -rf /tmp/build

WORKDIR /root