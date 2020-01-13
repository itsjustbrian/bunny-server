FROM fafcrumb/ffmpeg-alpine:latest AS ffmpeg
FROM alpine:edge

# ffmpeg
COPY --from=ffmpeg /usr/bin/ffmpeg /usr/local/bin

RUN echo @testing http://nl.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories && \
  apk add --no-cache \
  # ffmpeg dependencies
  sdl2 libass libva libvdpau \
  # Firefox
  firefox@testing ttf-freefont \
  # Node
  nodejs npm \
  # Virtual audio/display
  pulseaudio pulseaudio-utils alsa-plugins-pulse xvfb xvfb-run x11vnc websockify@testing \
  # Development
  bash

RUN apk add --no-cache fluxbox adwaita-icon-theme

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