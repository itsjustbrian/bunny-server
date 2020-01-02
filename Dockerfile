FROM ubuntu:19.04

# Dockerfile originally based on https://github.com/nodejs/docker-node/blob/master/6.11/slim/Dockerfile
# gpg keys listed at https://github.com/nodejs/node#release-team

# Node

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 12.14.0

RUN buildDeps='xz-utils curl ca-certificates gnupg2 dirmngr' \
  && set -x \
  && apt-get update && apt-get upgrade -y && apt-get install -y $buildDeps --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && set -ex \
  && for key in \
  94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
  FD3A5288F042B6850C66B31F09FE44734EB7990E \
  71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
  DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
  C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  B9AE9905FFD7803F25714661B63B535A4C206CA9 \
  77984A986EBC2AA786BC0F66B01FBB92821C587A \
  8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
  4ED778F539E3634C779C87C6D7062848A1AB005C \
  A48C2BEE680E841632CD4E44F07496B3EB3C1762 \
  B9E2F5981AA6E0CD28160D9FF13993A75599653C \
  ; do \
  gpg --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
  gpg --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
  gpg --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
  done \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && apt-get purge -y --auto-remove $buildDeps \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs


# Pulse audio
RUN apt-get update && apt-get install -y pulseaudio socat alsa-utils && \
  apt-get clean autoclean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# ffmpeg
RUN buildDeps='wget' && \
  apt-get update -y && apt-get install -y \
  $buildDeps \
  --no-install-recommends --force-yes && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
  wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && \
  tar --strip-components 1 -C /usr/bin -xf ffmpeg-release-amd64-static.tar.xz --wildcards */ffmpeg */ffprobe && \
  rm ffmpeg-release-amd64-static.tar.xz && \
  apt-get purge -y --auto-remove $buildDeps


# CHROME XVFB

# ENV LC_ALL C
# ENV DEBIAN_FRONTEND noninteractive
# ENV DEBCONF_NONINTERACTIVE_SEEN true

# ENV FIREFOX_VERSION 70.0
# ENV CHROME_VERSION 78.*
# #ENV CHROME_BETA_VERSION 77.*

# # Avoid ERROR: invoke-rc.d: policy-rc.d denied execution of start.
# # Avoid ERROR: invoke-rc.d: unknown initscript, /etc/init.d/systemd-logind not found.

# RUN echo "#!/bin/sh\nexit 0" > /usr/sbin/policy-rc.d && \
#   touch /etc/init.d/systemd-logind

# # Adding sudo for Throttle, lets see if we can find a better place (needed in Ubuntu 17)

# # fonts-ipafont-gothic fonts-ipafont-mincho # jp (Japanese) fonts, install seems to solve missing Chinese hk/tw fonts as well.
# # ttf-wqy-microhei fonts-wqy-microhei       # kr (Korean) fonts
# # fonts-tlwg-loma fonts-tlwg-loma-otf       # th (Thai) fonts
# # firefox-locale-hi fonts-gargi		    # Hindi (for now)

# RUN fonts='fonts-ipafont-gothic fonts-ipafont-mincho ttf-wqy-microhei fonts-wqy-microhei fonts-tlwg-loma fonts-tlwg-loma-otf firefox-locale-hi fonts-gargi' && \
#   buildDeps='bzip2 gnupg wget' && \
#   xvfbDeps='xvfb libgl1-mesa-dri xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic dbus-x11' && \
#   apt-get update && \
#   apt-get install -y $buildDeps --no-install-recommends && \
#   wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
#   echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
#   apt-get update && \
#   apt-get install -y \
#   android-tools-adb \
#   ca-certificates \
#   x11vnc \
#   sudo \
#   iproute2 \
#   $fonts \
#   $xvfbDeps \
#   --no-install-recommends && \
#   wget https://ftp.mozilla.org/pub/firefox/releases/${FIREFOX_VERSION}/linux-x86_64/en-US/firefox-${FIREFOX_VERSION}.tar.bz2 && \
#   tar -xjf firefox-${FIREFOX_VERSION}.tar.bz2 && \
#   rm firefox-${FIREFOX_VERSION}.tar.bz2 && \
#   mv firefox /opt/ && \
#   ln -s /opt/firefox/firefox /usr/local/bin/firefox && \
#   # Needed for when we install FF this way
#   apt-get install -y libdbus-glib-1-2 && \
#   apt-get purge -y --auto-remove $buildDeps && \
#   apt-get install -y google-chrome-stable=${CHROME_VERSION} && \
#   # apt-get install -y google-chrome-beta=${CHROME_BETA_VERSION} && \
#   apt-get clean autoclean && \
#   rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# We need a more recent ADB to be able to run Chromedriver 2.39
# COPY files/adb /usr/local/bin/

# Chromium

ENV LC_ALL C
ENV DEBIAN_FRONTEND noninteractive
ENV DEBCONF_NONINTERACTIVE_SEEN true

RUN apt-get update && apt-get install -y chromium-browser && \
  apt-get clean autoclean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
COPY ./chromium_policies.json /etc/chromium-browser/policies/managed

# Xvfb x11vnc
RUN apt-get update && apt-get install -y xvfb x11vnc && \
  apt-get clean autoclean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# MAIN

RUN useradd --user-group --create-home --shell /bin/false app

ENV HOME=/usr/src/app

# Create app directory
WORKDIR $HOME

RUN chown -R app:app $HOME

USER app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
EXPOSE 3000

# CMD [ "node", "index.js" ]

ENTRYPOINT ["./start.sh"]