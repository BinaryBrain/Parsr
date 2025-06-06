# Dockerfile

# 1. Use an official Node.js image (Debian-based) so node & npm are already available
FROM node:20-bullseye-slim

WORKDIR /usr/src/app

# 2. Install Debian packages: qpdf, ImageMagick, GraphicsMagick, Tesseract, MuPDF, Pandoc, Ghostscript, Python, etc.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      qpdf \
      imagemagick \
      graphicsmagick \
      tesseract-ocr \
      tesseract-ocr-all \
      libtesseract-dev \
      python3 \
      python3-pip \
      python3-tk \
      ghostscript \
      mupdf-tools \
      pandoc && \
    rm -rf /var/lib/apt/lists/*

# 3. Install Python-level packages via pip
RUN pip3 install --no-cache-dir \
      pdfminer.six \
      camelot-py \
      ghostscript

COPY package*.json ./
COPY . .

RUN npm install
RUN npm run copyAssets
RUN npm run build:ts
RUN npm install --prefix  api/server
RUN npm run --prefix api/server build

RUN mkdir -p api/server/dist/output
RUN chmod g+w api/server/dist/output

RUN sed -i 's/rights="none" pattern="PDF"/rights="read|write" pattern="PDF/g' /etc/ImageMagick-6/policy.xml && \
    sed -i 's/domain="resource" name="disk" value="1GiB"/ domain="resource" name="disk" value="32GiB"/g' /etc/ImageMagick-6/policy.xml


# 7. Expose default ports: 3001 for the API, 8080 for the Vue demo (if you run it via npm run serve)
EXPOSE 3001
EXPOSE 8080

# 9. Default command: start the API server.
#    If you want to run the demo web viewer instead, override this command to `npm run start:web:vue`
CMD ["npm", "run", "--prefix", "api/server", "start"]
