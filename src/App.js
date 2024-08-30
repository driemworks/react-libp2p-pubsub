import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { dcutr } from '@libp2p/dcutr'
import { identify } from '@libp2p/identify'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'
import { multiaddr } from '@multiformats/multiaddr'
import { createLibp2p } from 'libp2p'

function App() {
  
  const [node, setNode] = useState(null)

  useEffect(() => {
    setupLibp2p()
  }, []);

  const setupLibp2p = async () => {
    const relayAddr = '/ip4/172.26.99.162/tcp/41499/ws/p2p/12D3KooWDeKtjkbDHbMgjpatvyHjddB5oiWd7Espxe3oFLqwrSEd'

    const node = await createLibp2p({
      transports: [
        webSockets({
          // this allows non-secure WebSocket connections for purposes of the demo
          filter: filters.all
        }),
        circuitRelayTransport({
          discoverRelays: 2
        })
      ],
      connectionEncryption: [
        noise()
      ],
      streamMuxers: [
        yamux()
      ],
      connectionGater: {
        denyDialMultiaddr: () => {
          // by default we refuse to dial local addresses from browsers since they
          // are usually sent by remote peers broadcasting undialable multiaddrs and
          // cause errors to appear in the console but in this example we are
          // explicitly connecting to a local node so allow all addresses
          return false
        }
      },
      services: {
        identify: identify(),
        pubsub: gossipsub(),
        dcutr: dcutr()
      },
      connectionManager: {
        minConnections: 0
      }
    })

    setNode(node)

    console.log(`Node started with id ${node.peerId.toString()}`)

    const conn = await node.dial(multiaddr(relayAddr))

    console.log(`Connected to the relay ${conn.remotePeer.toString()}`)

    // Wait for connection and relay to be bind for the example purpose
    node.addEventListener('self:peer:update', (evt) => {
      // Updated self multiaddrs?
      console.log(`Advertising with a relay address of ${node.getMultiaddrs()[0].toString()}`)
    })

    let topic = 1;
    await node.services.pubsub.subscribe(topic)

    console.log('subscribed to topic ' + topic)

    // update peer connections
    node.addEventListener('connection:open', () => {
      console.log('hey')
    })
    node.addEventListener('connection:close', () => {
      console.log('hi')
    })

    // await node.services.pubsub.publish(topic, "adsfadsf")

    // // update topic peers
    // setInterval(() => {
    //   const peerList = node.services.pubsub.getSubscribers(topic);
    //   console.log(peerList)
    //     // .map(peerId => {
    //     //   // const el = document.createElement('li')
    //     //   // el.textContent = peerId.toString()
    //     //   // return el
    //     //   console.log(peerId)
    //     // })
    //   // DOM.topicPeerList().replaceChildren(...peerList)
    // }, 500)
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
