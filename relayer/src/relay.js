// import { noise } from '@chainsafe/libp2p-noise'
// import { yamux } from '@chainsafe/libp2p-yamux'
// import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
// import { identify } from '@libp2p/identify'
// import { webSockets } from '@libp2p/websockets'
// import { createLibp2p } from 'libp2p'

// const node = await createLibp2p({
//   addresses: {
//     listen: ['/ip4/0.0.0.0/tcp/0/ws']
//     // TODO check "What is next?" section
//     // announce: ['/dns4/auto-relay.libp2p.io/tcp/443/wss/p2p/QmWDn2LY8nannvSWJzruUYoLZ4vV83vfCBwd8DipvdgQc3']
//   },
//   transports: [
//     webSockets()
//   ],
//   connectionEncryption: [
//     noise()
//   ],
//   streamMuxers: [
//     yamux()
//   ],
//   services: {
//     identify: identify(),
//     relay: circuitRelayServer()
//   }
// })

// console.log(`Node started with id ${node.peerId.toString()}`)

// console.log('Listening on:')
// node.getMultiaddrs().forEach((ma) => console.log(ma.toString()))

// node.addEventListener('peer:connect', (evt) => {
//   // let peerId = evt.detail.id.toString();
//   console.log("accepted new peer connection");
// })

// @ts-check
import { createLibp2p } from 'libp2p'
import { autoNAT } from '@libp2p/autonat'
import { identify } from '@libp2p/identify'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { multiaddr } from '@multiformats/multiaddr'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { webSockets } from '@libp2p/websockets'
import { webRTC, webRTCDirect } from '@libp2p/webrtc'
import { tcp } from '@libp2p/tcp'
import { enable, disable } from '@libp2p/logger'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
// import { update, getPeerTypes, getAddresses, getPeerDetails } from './utils'
import { bootstrap } from '@libp2p/bootstrap'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
// import { PUBSUB_PEER_DISCOVERY } from './constants.js'

const PUBSUB_PEER_DISCOVERY = 'browser-peer-discovery'

async function main() {
  // enable('*')
  const libp2p = await createLibp2p({
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/9001/ws',
        '/ip4/0.0.0.0/tcp/9002',
      ],
    },
    transports: [
      webSockets(),
      tcp(),
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    connectionGater: {
      // Allow private addresses for local testing
      denyDialMultiaddr: async () => false,
    },
    services: {
      identify: identify(),
      autoNat: autoNAT(),
      relay: circuitRelayServer(),
      pubsub: gossipsub(),
    },
  })

  libp2p.services.pubsub.subscribe(PUBSUB_PEER_DISCOVERY)

  console.log('PeerID: ', libp2p.peerId.toString())
  console.log('Multiaddrs: ', libp2p.getMultiaddrs())
}

main()