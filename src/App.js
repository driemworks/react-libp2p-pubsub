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
    const relayAddr = '/ip4/172.26.99.162/tcp/9002/p2p/12D3KooWPYmpzKm1de6jsoSXTp6JBay4EP52HAw6n8S23d9sQnbs'

    const node = await createLibp2p({
      addresses: {
        listen: [
          // 👇 Listen for webRTC connections
          '/webrtc',
        ],
      },
      transports: [
        // Allow all WebSocket connections inclusing without TLS
        webSockets({ filter: filters.all }),
        webTransport(),
        webRTC(),
        circuitRelayTransport({
          discoverRelays: 1,
        }),
      ],
      connectionEncryption: [
        noise()
      ],
      streamMuxers: [
        yamux()
      ],
      connectionGater: {
        denyDialMultiaddr: async () => false,
      },
      services: {
        identify: identify(),
        pubsub: gossipsub(),
        // dcutr: dcutr()
      },
      peerDiscovery: [
        bootstrap({
          list: [relayAddr]
        }),
        pubsubPeerDiscovery({
          // Every 10 seconds publish our multiaddrs
          interval: 10_000,
          // The topic that the relay is also subscribed to
          topics: [PUBSUB_PEER_DISCOVERY],
        }),
      ],
      connectionManager: {
        minConnections: 0
      }
    })

    setNode(node)

    console.log(`Node started with id ${node.peerId.toString()}`)

    // const conn = await node.dial(multiaddr(relayAddr))

    // console.log(`Connected to the relay ${conn.remotePeer.toString()}`)

    // console.log('peers')
    // console.log(node.getPeers());

    // Wait for connection and relay to be bind for the example purpose
    node.addEventListener('self:peer:update', (evt) => {
      // Updated self multiaddrs?
      console.log(`Advertising with a relay address of ${JSON.stringify(node.getMultiaddrs())}`)
    })

    // let topic = 1;
    // await node.services.pubsub.subscribe(topic)

    // console.log('subscribed to topic ' + topic)

    // // update peer connections
    // node.addEventListener('connection:open', () => {
    //   console.log('hey')
    // })
    // node.addEventListener('connection:close', () => {
    //   console.log('hi')
    // })

    // await node.services.pubsub.publish(topic, "adsfadsf")

    // // update topic peers
    setInterval(() => {
      console.log(node.getPeers().length)
      // const peerList = node.services.pubsub.getSubscribers(topic);
      // console.log(peerList)
      // .map(peerId => {
      //   // const el = document.createElement('li')
      //   // el.textContent = peerId.toString()
      //   // return el
      //   console.log(peerId)
      // })
      // DOM.topicPeerList().replaceChildren(...peerList)
    }, 500)
  }

  const handleSub = async () => {

  }



  return (
    <div className="App">
      <button onClick={handleSub}>Connect to Peer</button>
    </div>
  );
}

export default App;
