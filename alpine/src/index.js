//const { spawn } = require('child_process');
const FfmpegCommand = require('fluent-ffmpeg');
const Mp4Frag = require('mp4frag');
const io = require('socket.io');

let streamInitialized = false;
let socket = null;

const mp4frag = new Mp4Frag({ bufferListSize: 3 })
  .once('initialized', ({ mime }) => {
    console.log('Stream initialized with mime type: ', mime);
  });

const getInitSegment = () => new Promise((resolve) => {
  if (mp4frag.initialization) resolve(mp4frag.initialization);
  else mp4frag.once('initialized', ({ initialization }) => {
    resolve(initialization);
  });
});

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
  // .addOption('-draw_mouse', '1')
  .input(process.env.DISPLAY)
  .inputFormat('x11grab')
  .videoCodec('libx264')
  .inputFPS(60)
  //.size('854x480')
  .inputOptions([
    `-s ${process.env.DISPLAY_WIDTH}x${process.env.DISPLAY_HEIGHT}`,
    //'-draw_mouse 0'
    //'-probesize 32',
    //'-analyzeduration 0'
  ])
  .outputOptions([
    '-preset ultrafast',
    '-tune zerolatency',
    // '-profile:v high',
    // '-level 3.0',
    '-pix_fmt yuv420p',
    '-g 120',
    //'-b:v 15M',
    //'-maxrate 30M',
    //'-bufsize 5M',
    '-movflags +empty_moov+default_base_moof+frag_keyframe',
    '-reset_timestamps 1',
  ])
  .input('default')
  .inputFormat('pulse')
  .audioChannels(1)
  .audioCodec('libopus')
  .audioBitrate('96k')
  .audioFrequency(48000)
  .outputOptions([
    '-strict experimental'
  ])
  .format('mp4')
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
  });


// command.pipe().on('data', (chunk) => {
//   if (socket && streamInitialized) socket.emit('data', chunk);
//   if (!mp4frag.initialization) mp4frag._parseChunk(chunk);
// });

mp4frag.on('segment', (segment) => {
  console.log(mp4frag.timestamp, mp4frag.duration);
  if (socket && streamInitialized) socket.emit('data', segment);
});

command.pipe(mp4frag);



(io.listen(8080)).on('connect', (_socket) => {

  console.log('connected');

  socket = _socket;

  socket.on('start-stream', async () => {
    console.log('Initializing stream')
    const initSegment = await getInitSegment();
    socket.emit('data', initSegment);
    streamInitialized = true;
  });

  socket.on('disconnect', () => streamInitialized = socket = false);
  socket.on('stop-stream', () => streamInitialized = socket = false);
});