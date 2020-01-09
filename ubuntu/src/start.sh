#!/bin/bash

# Start the pulseaudio server
pulseaudio -D --exit-idle-time=-1

# # Load the virtual sink and set it as default
pacmd load-module module-virtual-sink sink_name=v1
pacmd set-default-sink v1

# # Set the monitor of v1 sink to be the default source
pacmd set-default-source v1.monitor

# export DISPLAY=:99
# xvfb-run -server-num=$DISPLAY --server-args="-screen 0 1280x800x24 -ac -nolisten tcp -dpi 96 +extension RANDR" google-chrome-stable --disable-gpu --no-sandbox &
# Without this we get a one pixel black border around the slightly-smaller chromium window
let CHROMIUM_WIDTH=DISPLAY_WIDTH+1
let CHROMIUM_HEIGHT=DISPLAY_HEIGHT+1
# Start chromium in a virtual display

# export $(dbus-launch)
# export DBUS_SYSTEM_BUS_ADDRESS=$DBUS_SESSION_BUS_ADDRESS
# xvfb-run -server-num=$DISPLAY --server-args="-screen 0 ${DISPLAY_WIDTH}x${DISPLAY_HEIGHT}x24 -ac -nolisten tcp -dpi 96 +extension RANDR" chromium-browser --window-size=${CHROMIUM_WIDTH},${CHROMIUM_HEIGHT} --window-position=0,0 --disable-gpu --disable-gpu-vsync --disable-accelerated-compositing --disable-software-rasterizer --disable-gpu-compositing --enable-automation &
xvfb-run -server-num=$DISPLAY --server-args="-screen 0 ${DISPLAY_WIDTH}x${DISPLAY_HEIGHT}x24 -ac -nolisten tcp -dpi 96 +extension RANDR" /usr/bin/firefox --window-size=${CHROMIUM_WIDTH},${CHROMIUM_HEIGHT} --window-position=0,0 --disable-gpu &
x11vnc -display WAIT$DISPLAY  -rfbport 3000 -nopw &
# x11vnc -display WAIT:99  -rfbport 3000 -nopw &
# ffmpeg -video_size 1280x720 -framerate 25 -f x11grab -i :99.0+0,0 -f pulse -ac 1 -i default -c:a libopus -strict -2 -b:a 96k output.mp4
# valgrind --vgdb=yes --vgdb-error=0 node index.js
node index.js