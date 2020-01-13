FROM alpine:edge

RUN \
  apk add --no-cache --virtual build_deps \
  wget musl-dev gcc g++ make cmake \
  libgcrypt-dev libjpeg-turbo-dev libpng-dev libice-dev libx11-dev libxdamage-dev libxext-dev libxfixes-dev libxi-dev libxinerama-dev libxrandr-dev libxtst-dev openssl-dev lzo-dev && \
  wget https://github.com/itsjustbrian/libvncserver/archive/LibVNCServer-0.9.12.tar.gz && \
  tar xzvf LibVNCServer-0.9.12.tar.gz && \
  cd libvncserver-LibVNCServer-0.9.12 && \
  mkdir build && cd build && \
	cmake \
		-DCMAKE_BUILD_TYPE=RelWithDebInfo \
		-DCMAKE_INSTALL_PREFIX=/usr \
		-DBUILD_SHARED_LIBS=ON \
		-DWITH_ZLIB=ON \
		-DWITH_LZO=ON \
		-DWITH_JPEG=ON \
		-DWITH_PNG=ON \
		-DWITH_SDL=ON \
		-DWITH_THREADS=ON \
		-DWITH_GNUTLS=ON \
		-DWITH_OPENSSL=ON \
		-DWITH_SYSTEMD=OFF \
		-DWITH_GCRYPT=ON \
		-DWITH_FFMPEG=ON \
		-DWITH_WEBSOCKETS=ON \
		-DWITH_SASL=ON \
		.. && \
  make && \
  apk update && apk del build_deps && \
  mkdir -p lib && \
  mv libvnc*.so* lib

RUN apk add --no-cache bash