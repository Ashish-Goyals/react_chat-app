class PeerService {
  constructor () {
    this.peer = new RTCPeerConnection ({
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:global.stun.twilio.com:3478',
          ],
        },
      ],
    });

    this.remoteStream = new MediaStream ();
  }

  addTracks (stream) {
    if (!stream) return;
    stream.getTracks ().forEach (track => {
      this.peer.addTrack (track, stream);
    });
  }

  async getOffer () {
    try {
      const offer = await this.peer.createOffer ();
      await this.peer.setLocalDescription (offer);
      return this.peer.localDescription;
    } catch (err) {
      console.error ('getOffer Error:', err);
      throw err;
    }
  }

  async getAnswer (offer) {
    try {
      await this.peer.setRemoteDescription (new RTCSessionDescription (offer));
      const answer = await this.peer.createAnswer ();
      await this.peer.setLocalDescription (answer);
      return this.peer.localDescription;
    } catch (err) {
      console.error ('getAnswer Error:', err);
      throw err;
    }
  }

  async setRemoteDescription (answer) {
    if (!answer || !answer.sdp || !answer.type) {
      console.error ('Invalid SDP answer received');
      throw new Error ('Invalid SDP answer received');
    }

    try {
      await this.peer.setRemoteDescription (new RTCSessionDescription (answer));
    } catch (err) {
      console.error ('setRemoteDescription Error:', err);
      throw err;
    }
  }
}

export default new PeerService ();

// // src/service/peer.js
// class PeerService {
//   constructor () {
//     if (!this.peer) {
//       this.peer = new RTCPeerConnection ({
//         iceServers: [
//           {
//             urls: ['stun:stun.l.google.com:19302'],
//           },
//         ],
//       });
//     }
//   }

//   async getOffer () {
//     if (this.peer.signalingState !== 'stable') {
//       throw new Error ('Peer is not in stable state to create offer');
//     }

//     const offer = await this.peer.createOffer ();
//     await this.peer.setLocalDescription (offer);
//     return offer;
//   }

//   async getAnswer (offer) {
//     await this.peer.setRemoteDescription (new RTCSessionDescription (offer));
//     const answer = await this.peer.createAnswer ();
//     await this.peer.setLocalDescription (answer);
//     return answer;
//   }
//   async setRemoteDescription (answer) {
//     if (!answer || !answer.type || !answer.sdp) {
//       console.warn ('Skipping invalid remote description:', answer);
//       return;
//     }

//     const currentDesc = this.peer.remoteDescription;
//     if (
//       currentDesc &&
//       currentDesc.type === answer.type &&
//       currentDesc.sdp === answer.sdp
//     ) {
//       console.warn ('Remote description already set, skipping.');
//       return;
//     }

//     await this.peer.setRemoteDescription (new RTCSessionDescription (answer));
//   }
// }

// const peer = new PeerService ();
// export default peer;
