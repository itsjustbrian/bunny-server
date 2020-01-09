class PeerConnection {

  constructor(PeerConstructor, socket, peerOptions = { initiator: false }) {
    this.PeerConstructor = PeerConstructor;
    this.socket = socket;
    this.peerOptions = peerOptions;
    this._ondata = null;
    this.peer = null;
  }

  set ondata(cb) {
    this._ondata = cb;
  }

  get connected() {
    return this.peer && this.peer.connected;
  }

  send(data) {
    this.peer.send(data);
  };

  close() {
    console.log(`Destroying peer connection`);
    console.log(this.peer);
    if (this.peer) this.peer.destroy();
  };

  connect() {
    this.close();
    this.peer = this._buildPeer();
    this.socket.on('signal', this._onSignallingOffer.bind(this));
  };

  _buildPeer() {
    console.log('creating');
    const peer = new this.PeerConstructor(this.peerOptions);
    //peer._debug = console.log;

    console.log('created');

    peer.on('error', (err) => {
      console.error(`WebRTC error`, err);
      this.close();
    });

    peer.on('signalingStateChange', (state) => {
      console.log(`WebRTC state changed`, state);
    });

    peer.on('close', () => {
      console.log(`WebRTC closed`);
      this.socket.removeAllListeners('signal');
    });

    peer.on('signal', (data) => {
      console.log(`WebRTC signalled`);
      this.socket.emit('signal', data);
    });

    peer.on('connect', () => {
      console.log(`WebRTC connected`);
    });

    peer.on('data', (data) => {
      this._ondata(data);
    });

    return peer;
  };

  _onSignallingOffer(offer) {
    //console.log(peer._pc.signalingState, peer._pc.iceGatheringState, peer._pc.iceConnectionState, peer._pc.connectionState);
    console.log(`Received signalling offer`);
    this.peer.signal(offer);
  };

}

module.exports = PeerConnection;