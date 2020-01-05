FROM fafcrumb/ffmpeg-alpine:latest AS ffmpeg
FROM alpine:edge

# ffmpeg
COPY --from=ffmpeg /usr/bin/ffmpeg /usr/local/bin

# Build dependencies
RUN apk add --no-cache \
  # webrtc
  libc6compat

# Node
RUN apk add --no-cache nodejs

# Virtual audio/display
RUN apk add --no-cache pulseaudio pulseaudio-alsa alsa-plugins-pulse socat alsa-utils xvfb

# Chromium
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont

COPY ./chromium_policies.json /etc/chromium-browser/policies/managed

# DEVELOPMENT

RUN apk add --no-cache x11vnc bash

# MAIN

ENV HOME=/usr/src/app

# App directory
WORKDIR $HOME

# Bundle app source
COPY package*.json ./
RUN npm ci --prod
COPY ./src .

# Add user for chromium
RUN addgroup -S appuser && adduser -S -g appuser appuser \
  && mkdir -p /home/adduser/Downloads $HOME \
  && chown -R appuser:appuser /home/appuser \
  && chown -R appuser:appuser $HOME

USER appuser

EXPOSE 8080
EXPOSE 3000

CMD ["sh", "./start.sh"]