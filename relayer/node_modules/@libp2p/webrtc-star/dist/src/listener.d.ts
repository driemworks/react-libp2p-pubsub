import type { PeerId } from '@libp2p/interface-peer-id';
import type { Upgrader, ConnectionHandler, Listener } from '@libp2p/interface-transport';
import type { WebRTCStar, WebRTCStarListenerOptions } from './transport.js';
export declare function createListener(upgrader: Upgrader, handler: ConnectionHandler, peerId: PeerId, transport: WebRTCStar, options: WebRTCStarListenerOptions): Listener;
//# sourceMappingURL=listener.d.ts.map