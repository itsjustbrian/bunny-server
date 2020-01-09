FROM fafcrumb/ffmpeg-ubuntu:latest AS ffmpeg
FROM ubuntu:19.04

ENV LD_LIBRARY_PATH=/usr/local/lib
COPY --from=ffmpeg /usr/bin/ffmpeg /usr/local/bin

# Node
RUN apt-get update && apt-get install -y curl && \
  curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
  apt-get update && apt-get install -y \
  nodejs \
  pulseaudio socat alsa-utils \
  xvfb x11vnc && \
  apt-get purge --auto-remove -y curl && \
  apt-get clean autoclean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Chromium

RUN apt-get update && apt-get install -y wget --no-install-recommends \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y chromium-browser fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf dbus-x11 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get purge --auto-remove -y wget \
  && apt-get clean autoclean \
  && rm -rf /src/*.deb /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY ./chromium_policies.json /etc/chromium-browser/policies/managed

# ffmpeg dependencies
RUN apt-get update && apt-get install -y \
  libxcb-xfixes0 libsdl2-2.0-0 libsndio7.0 libass9 libva2 libva-drm2 libva-x11-2 libvdpau1

# MAIN

ENV HOME=/usr/src/app

WORKDIR $HOME

COPY ./src .

COPY package*.json ./

RUN npm ci --only=production \
  && groupadd -r appuser && useradd -r -g appuser -G audio,video appuser \
  && mkdir -p /home/appuser/Downloads $HOME \
  && chown -R appuser:appuser /home/appuser \
  && chown -R appuser:appuser $HOME

USER appuser

EXPOSE 8080
EXPOSE 3000

ENTRYPOINT ["./start.sh"]