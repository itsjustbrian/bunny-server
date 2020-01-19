//const { spawn } = require('child_process');
const FfmpegCommand = require('fluent-ffmpeg');
const Mp4Frag = require('mp4frag');
const io = require('socket.io');
const express = require('express');
const path = require('path');
const cors = require('cors')

let streamInitialized = false;
let socket = null;

// const mp4frag = new Mp4Frag({ bufferListSize: 3 })
//   .once('initialized', ({ mime }) => {
//     console.log('Stream initialized with mime type: ', mime);
//   });

const mp4frag = new Mp4Frag({ hlsListSize: 3, hlsBase: 'pool' })
  .once('initialized', ({ mime }) => {
    console.log('Stream initialized with mime type: ', mime, 'and m3u8: ', mp4frag.m3u8);
  });

mp4frag.on('error', msg => {
  console.error(`mp4frag error "${msg}"`)
})

// const getInitSegment = () => new Promise((resolve) => {
//   if (mp4frag.initialization) resolve(mp4frag.initialization);
//   else mp4frag.once('initialized', ({ initialization }) => {
//     resolve(initialization);
//   });
// });

// const ffmpeg = spawn('ffmpeg', [
//   '-s', '1280x720', '-framerate', '60', '-probesize', '32', '-f', 'x11grab', '-i', `${process.env.DISPLAY}.0+0,0`,
//   '-c:v', 'libx264', '-preset', 'ultrafast', '-tune', 'zerolatency', '-pix_fmt', 'yuv420p',
//   '-f', 'mp4', '-g', '1', '-movflags', '+empty_moov+default_base_moof+frag_keyframe', '-reset_timestamps', '1',
//   'pipe:1'
// ])
//   .on('error', (error) => {
//     console.log('error', error);
//   })
//   .on('exit', (code, signal) => {
//     console.log('exit', code, signal);
//   });

// ffmpeg.stdio[1].on('data', (chunk) => {
//   if (peer && peer.connected && streamInitialized) peer.send(chunk);
//   if (!mp4frag.initialization) mp4frag._parseChunk(chunk);
// });

// const command = new FfmpegCommand()
//   // .addOption('-draw_mouse', '1')
//   .input(process.env.DISPLAY)
//   .inputFormat('x11grab')
//   .videoCodec('libx264')
//   .inputFPS(60)
//   //.size('854x480')
//   .inputOptions([
//     `-s ${process.env.DISPLAY_WIDTH}x${process.env.DISPLAY_HEIGHT}`,
//     //'-draw_mouse 0'
//     '-probesize 32',
//     '-analyzeduration 0'
//   ])
//   .outputOptions([
//     '-preset ultrafast',
//     '-tune zerolatency',
//     // '-profile:v high',
//     // '-level 3.0',
//     '-pix_fmt yuv420p',
//     '-g 1',
//     //'-b:v 15M',
//     //'-maxrate 30M',
//     //'-bufsize 5M',
//     '-movflags +empty_moov+default_base_moof+frag_keyframe',
//     '-reset_timestamps 1',
//   ])
//   // .input('default')
//   // .inputFormat('pulse')
//   // .audioChannels(1)
//   // .audioCodec('libopus')
//   // .audioBitrate('96k')
//   // .audioFrequency(48000)
//   // .outputOptions([
//   //   '-strict experimental'
//   // ])
//   .format('mp4')
//   // .save('test4.mp4')
//   // .duration(5)
//   .on('start', (commandLine) => {
//     console.log('Spawned Ffmpeg with command: ' + commandLine);
//   })
//   .on('error', (err) => {
//     console.log('An error occurred: ' + err.message);
//   })
//   .on('end', () => {
//     console.log('Processing finished !');
//   });

const command = new FfmpegCommand()
  .input('default')
  .inputFormat('pulse')
  .audioChannels(1)
  .audioCodec('libfdk_aac')
  .audioBitrate('128k')
  .audioFrequency(44100)
  .inputOptions([
    //'-itsoffset 00:00:02.05112314224',
    '-async 1',
    //'-itsoffset 0.2',
    '-thread_queue_size 512'
  ])
  // .outputOptions([
  //   //'-strict experimental'
  // ])
  // .addOption('-draw_mouse', '1')
  .input(process.env.DISPLAY)
  .inputFormat('x11grab')
  .videoCodec('libx264')
  .videoBitrate('5000k')
  .fps(30)
  //.size('854x480')
  .inputOptions([
    '-framerate 30',
    `-s ${process.env.DISPLAY_WIDTH}x${process.env.DISPLAY_HEIGHT}`,
    //'-draw_mouse 0'
    '-probesize 10000000',
    //'-analyzeduration 100000000',
    '-thread_queue_size 512'
  ])
  .outputOptions([
    '-preset ultrafast',
    '-tune zerolatency',
    //'-copyts',
    //'-async 1',
    //'-sc_threshold 0',
    //'-x264opts no-scenecut',
    //'-profile:v high',
    //'-level 3.0',
    '-pix_fmt yuv420p',
    '-g 60',
    '-keyint_min 60',
    //'-b:v 15M',
    //'-maxrate 30M',
    //'-bufsize 5M',
    //'-movflags +dash+negative_cts_offsets',
    //'-movflags +dash',
    //'-reset_timestamps 1',
  ])
  .format('dash')
  .outputOptions([
    '-seg_duration 2',
    '-remove_at_exit 1',
    '-window_size 20',
    '-extra_window_size 30',
    '-use_template 1',
    '-use_timeline 0',
    //'-index_correction 1',
    '-utc_timing_url https://time.akamai.com/?iso',
    //'-ignore_io_errors 1'
    //'-adaptation_sets "id=0,streams=v id=1,streams=a"',
    //'-init_seg_name "live-$RepresentationID$-init.m4s"',
    //'-media_seg_name "live-$RepresentationID$-$Time$.m4s"'
  ])
  .output('manifest.mpd')
  // .save('test4.mp4')
  // .duration(5)
  .on('start', (commandLine) => {
    console.log('Spawned Ffmpeg with command: ' + commandLine);
  })
  .on('error', (err) => {
    console.log('An error occurred: ' + err.message);
  })
  .on('end', () => {
    console.log('Processing finished !');
  })
  .run();

// ffmpeg -async 1 -f x11grab -r 30 -s 1280x720 -probesize 10000000 -analyzeduration 100000000 -thread_queue_size 512 -i :99 -f pulse -thread_queue_size 512 -i default -qscale 2 -y -ac 1 -acodec libopus -b:a 160k -ar 48000 -vcodec libx264 -b:v 5000k -r 30 -tune zerolatency -profile:v high -level 3.0 -pix_fmt yuv420p -g 60 -keyint_min 60 -reset_timestamps 1 -f dash -seg_duration 4 -remove_at_exit 1 -window_size 10 -extra_window_size 10 -use_template 1 -use_timeline 1 manifest.mpd
// ffmpeg -f x11grab -r 30 -s 1280x720 -probesize 10000000 -thread_queue_size 512 -async 1 -i :99 -f pulse -thread_queue_size 512 -i default -y -ac 1 -acodec libfdk_aac -b:a 128k -ar 44100 -vcodec libx264 -b:v 5000k -r 30 -preset ultrafast -tune zerolatency -pix_fmt yuv420p -g 60 -keyint_min 60 -f dash -seg_duration 2 -remove_at_exit 1 -window_size 20 -extra_window_size 30 -use_template 1 -use_timeline 0 -utc_timing_url https://time.akamai.com/?iso manifest.mpd
// ffmpeg -f x11grab -framerate 30 -s 1280x720 -probesize 10000000 -thread_queue_size 512 -async 1 -i :99 -f pulse -thread_queue_size 512 -i default -y -ac 1 -acodec libfdk_aac -b:a 128k -ar 44100 -vcodec libx264 -b:v 5000k -r 30 -preset ultrafast -tune zerolatency -pix_fmt yuv420p -g 60 -keyint_min 60 -f dash -seg_duration 2 -remove_at_exit 1 -window_size 20 -extra_window_size 30 -use_template 1 -use_timeline 0 -utc_timing_url https://time.akamai.com/?iso manifest.mpd

// command.pipe().on('data', (chunk) => {
//   if (socket && streamInitialized) socket.emit('data', chunk);
//   if (!mp4frag.initialization) mp4frag._parseChunk(chunk);
// });

// mp4frag.on('segment', (segment) => {
//   console.log(mp4frag.timestamp, mp4frag.duration);
//   if (socket && streamInitialized) socket.emit('data', segment);
// });

//command.pipe(mp4frag);


(io.listen(8080)).on('connect', (_socket) => {

  console.log('connected');

  // socket = _socket;

  // socket.on('start-stream', async () => {
  //   console.log('Initializing stream')
  //   const initSegment = await getInitSegment();
  //   socket.emit('data', initSegment);
  //   streamInitialized = true;
  // });

  // socket.on('disconnect', () => streamInitialized = socket = false);
  // socket.on('stop-stream', () => streamInitialized = socket = false);
});


const app = express();
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

app.use(express.static(__dirname))
// app.get('/manifest.mpd', (req, res) => {
//   res.sendFile(path.join(__dirname, 'manifest.mpd'));
// });

app.get('/pool.m3u8', (req, res) => {
  if (mp4frag.m3u8) {
    res.writeHead(200, { 'Content-Type': 'application/vnd.apple.mpegurl' });
    res.end(mp4frag.m3u8);
  } else {
    res.sendStatus(503);//todo maybe send 400
  }
});

app.get('/init-pool.mp4', (req, res) => {
  console.log('hi');
  console.log(mp4frag.initialization);
  console.log(mp4frag.m3u8)
  if (mp4frag.initialization) {
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    res.end(mp4frag.initialization);
  } else {
    res.sendStatus(503);
  }
});

app.get('/pool:id.m4s', (req, res) => {
  const segment = mp4frag.getHlsSegment(req.params.id);
  if (segment) {
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    res.end(segment);
  } else {
    res.sendStatus(503);
  }
});

app.listen(8081);