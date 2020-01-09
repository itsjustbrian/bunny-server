FROM fafcrumb/ffmpeg-alpine:latest AS ffmpeg
FROM alpine:edge
# FROM node:12.14.0-alpine3.11

# ffmpeg
COPY --from=ffmpeg /usr/bin/ffmpeg /usr/local/bin
# ffmpeg dependencies
RUN apk add --no-cache sdl2 libass libva libvdpau

# Firefox
RUN apk add --no-cache \
  firefox-esr \
  ttf-freefont

# Node
RUN apk add --no-cache nodejs npm

# Virtual audio/display
RUN apk add --no-cache pulseaudio pulseaudio-utils alsa-plugins-pulse xvfb xvfb-run x11vnc

# DEVELOPMENT
RUN apk add --no-cache bash

# MAIN

ENV USERNAME=appuser
ENV HOME=/home/${USERNAME}
ENV APP_LOCATION=/usr/src/app

# App src directory
WORKDIR ${APP_LOCATION}

# Bundle app source
COPY package*.json ${APP_LOCATION}/
RUN npm ci --prod && apk update && apk del npm
# RUN npm install
COPY ./src ${APP_LOCATION}

# Add user for browser
RUN addgroup -S ${USERNAME} && adduser -S -g ${USERNAME} ${USERNAME} \
  && mkdir -p ${HOME}/Downloads ${APP_LOCATION} \
  && chown -R ${USERNAME}:${USERNAME} ${HOME} \
  && chown -R ${USERNAME}:${USERNAME} ${APP_LOCATION}

USER ${USERNAME}

EXPOSE 8080
EXPOSE 3000

CMD ["sh", "./start.sh"]