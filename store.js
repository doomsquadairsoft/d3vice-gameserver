/*
 * Store.js
 *
 * The fortune data
 */

module.exports = {
  network: {
    name: { type: String },
    nodes: { link: 'node', isArray: true },
    hardware: { link: 'hardware', isArray: true }
  },
  game: {
    events: { link: 'event', isArray: true }
  },
  event: {
    time: { type: Date },
    type: { type: String },
    params: { type: Object }
  },
  node: {
    defaultProfile: { type: String },
    name: { type: String },
    nodeId: { type: String },
    hardware: { link: 'hardware', inverse: 'node', isArray: true }
  },
  hardware: {
    gpio: { type: Number },
    name: { type: String },
    defaultProfile: { type: String },
    type: { type: String },
    node: { link: 'node', inverse: 'hardware' }
  }
}
