import './App.css';
import { useEffect, useState } from 'react';
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { dcutr } from '@libp2p/dcutr'
import { identify } from '@libp2p/identify'
import { webTransport } from '@libp2p/webtransport'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { multiaddr } from '@multiformats/multiaddr'
import { createLibp2p } from 'libp2p'
import { bootstrap } from '@libp2p/bootstrap';
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { webRTC } from '@libp2p/webrtc';

function App() {

  const PUBSUB_PEER_DISCOVERY = 'browser-peer-discovery'

  const [node, setNode] = useState(null)

  useEffect(() => {
    setupLibp2p()
  }, []);

  const setupLibp2p = async () => {
    const relayAddr = '/ip4/172.26.99.162/tcp/9001/ws/p2p/12D3KooWHBgpF8QdwQcffQ26ZwVs2KtveynK8QeHYLDcwbUDwCqg'

    const node = await createLibp2p({
      addresses: {
        listen: [
          // 👇 Listen for webRTC connection
          '/webrtc',
        ],
      },
      transports: [
        webSockets({
          // Allow all WebSocket connections inclusing without TLS
          filter: filters.all,
        }),
        webTransport(),
        webRTC(),
        // 👇 Required to create circuit relay reservations in order to hole punch browser-to-browser WebRTC connections
        circuitRelayTransport({
          discoverRelays: 1,
        }),
      ],
      connectionEncryption: [noise()],
      streamMuxers: [yamux()],
      connectionGater: {
        // Allow private addresses for local testing
        denyDialMultiaddr: async () => false,
      },
      peerDiscovery: [
        bootstrap({
          list: [relayAddr],
        }),
        pubsubPeerDiscovery({
          interval: 10_000,
          topics: [PUBSUB_PEER_DISCOVERY],
        }),
      ],
      services: {
        pubsub: gossipsub(),
        identify: identify(),
      },
    })

    setNode(node)

    console.log(`Node started with id ${node.peerId.toString()}`)

    // const conn = await node.dial(multiaddr(relayAddr))

    // console.log(`Connected to the relay ${conn.remotePeer.toString()}`)

    console.log('peers')
    console.log(node.getPeers());

    // Wait for connection and relay to be bind for the example purpose
    node.addEventListener('self:peer:update', (evt) => {
      // Updated self multiaddrs?
      console.log(`Advertising with a relay address of ${JSON.stringify(node.getMultiaddrs())}`)
    })


    node.services.pubsub.subscribe("test-topic")

    node.services.pubsub.addEventListener('message', event => {
      const topic = event.detail.topic
      const message = toString(event.detail.data)
    
      console.log(`Message received on topic '${topic}'`)
      console.log(event)
    })

    // // update topic peers
    setInterval(() => {
      console.log(node.getPeers().length)
    }, 500)
  }

  const handlePubSub = async () => {
    node.services.pubsub.publish("test-topic", [1])
  }

  return (
    <div className="App">
      <button onClick={handlePubSub}>Connect to Peer</button>
    </div>
  );
}

export default App;
