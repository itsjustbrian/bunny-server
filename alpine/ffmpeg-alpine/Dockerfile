FROM alpine:edge

ENV HOME=/usr

RUN apk add --no-cache \
  autoconf \
  automake \
  alpine-sdk \
  cmake \
  git \
  pulseaudio-dev \
  libass-dev \
  freetype-dev \
  sdl2-dev \
  libtool \
  libva-dev \
  libvdpau-dev \
  libvorbis-dev \
  libxcb-dev \
  pkgconfig \
  texinfo \
  wget \
  zlib-dev \
  && mkdir -p $HOME/ffmpeg_sources $HOME/bin

# NASM
RUN \
  cd ~/ffmpeg_sources && \
  wget https://www.nasm.us/pub/nasm/releasebuilds/2.14.02/nasm-2.14.02.tar.bz2 && \
  tar xjvf nasm-2.14.02.tar.bz2 && \
  cd nasm-2.14.02 && \
  ./autogen.sh && \
  PATH="$HOME/bin:$PATH" ./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" && \
  make -j4 && \
  make install

# Yasm
RUN \
  cd ~/ffmpeg_sources && \
  wget -O yasm-1.3.0.tar.gz https://www.tortall.net/projects/yasm/releases/yasm-1.3.0.tar.gz && \
  tar xzvf yasm-1.3.0.tar.gz && \
  cd yasm-1.3.0 && \
  ./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" && \
  make -j4 && \
  make install

# libx264
RUN \
  cd ~/ffmpeg_sources && \
  git -C x264 pull 2> /dev/null || git clone --depth 1 https://code.videolan.org/videolan/x264.git && \
  cd x264 && \
  PATH="$HOME/bin:$PATH" PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig" ./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" --enable-static --enable-pic && \
  PATH="$HOME/bin:$PATH" make -j4 && \
  make install

# libopus
RUN \
  cd ~/ffmpeg_sources && \
  git -C opus pull 2> /dev/null || git clone --depth 1 https://github.com/xiph/opus.git && \
  cd opus && \
  ./autogen.sh && \
  ./configure --prefix="$HOME/ffmpeg_build" --disable-shared && \
  make -j4 && \
  make install

# ffmpeg
RUN \
  cd ~/ffmpeg_sources && \
  wget -O ffmpeg-snapshot.tar.bz2 https://ffmpeg.org/releases/ffmpeg-snapshot.tar.bz2 && \
  tar xjvf ffmpeg-snapshot.tar.bz2 && \
  cd ffmpeg && \
  PATH="$HOME/bin:$PATH" PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig" ./configure \
  --prefix="$HOME/ffmpeg_build" \
  --pkg-config-flags="--static" \
  --extra-cflags="-I$HOME/ffmpeg_build/include" \
  --extra-ldflags="-L$HOME/ffmpeg_build/lib" \
  --extra-libs="-lpthread -lm" \
  --bindir="$HOME/bin" \
  --enable-gpl \
  --enable-libass \
  --enable-libfreetype \
  --enable-libopus \
  --enable-libvorbis \
  --enable-libx264 \
  --enable-libpulse && \
  PATH="$HOME/bin:$PATH" make -j4 && \
  make install && \
  hash -r