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
    nodes: { link: 'node', isArray: true },
    hardware: { link: 'hardware', isArray: true },
    events: { link: 'event', isArray: true },
    type: { link: 'game-type', inverse: 'games' },
    status: { type: String },
    time: { link: 'time' }
  },
  time: {
    start: { type: Date },
    end: { type: Date },
    limit: { type: Date }
  },
  'game-type': {
    name: { type: String },
    core: { type: Boolean },
    games: { link: 'game', inverse: 'type', isArray: true },
    requirements: { link: 'hardware', isArray: true },
    optionals: { link: 'hardware', isArray: true }
  },
  'event': {
    time: { type: Date },
    type: { type: String },
    params: { type: Object }
  },
  node: {
    defaultProfile: { type: String },
    name: { type: String },
    nodeId: { type: String },
    hardware: { link: 'hardware', inverse: 'node', isArray: true },
    authorized: { type: Boolean },
    associationToken: { type: String }
  },
  hardware: {
    gpio: { type: Number },
    name: { type: String },
    defaultProfile: { type: String },
    type: { type: String },
    node: { link: 'node', inverse: 'hardware' }
  }
}
