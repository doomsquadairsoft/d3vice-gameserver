# d3vice-gameserver
Code which runs the game.

* game logic handled by node
* state stored in redis
* communication between D3vice nodes handled by RabbitMQ (MQTT) pub/sub
* api data served to client via express


## Environment variables

can be env vars or saved in `config.json`

```json
{
  "D3VICE_"
  "D3VICE_GAME_IPNS_ADDRESS": "",
  "D3VICE_NETWORK_IPNS_ADDRESS": "",
  "REDIS_HOST": "",
  "REDIS_PORT": "",
  "REDIS_PASSWORD": "",
  "REDIS_USERNAME": ""
}
```

## Notes/Brainstorming

### Low power mode

*DEPRECATED BECAUSE USING MQTT PUB/SUB* There could be a game event that tells all D3vice nodes to poll less often, to save power. Useful for when game is paused or game just ended, etc.



### esp8266 or other low-memory D3vice node

This is any D3vice on the network that can't run IPFS, and how it gets it's game data

* Starts up
* acquires own IP address
* Finds IP address of IPFS gateway/gameserver
  * multicast request? Is there a packet that only IPFS responds to? (@todo research needed)
  * for every address in range, GET `*/ipfs` looking for a recognized reply
  * DNS? (probably not, since this is supposed to work in remote areas *and* in existing LANs)
* Does RESTful request to gameserver that says, "I am here"
  * gameserver creates timestamped node discovery event in gameState
  * gameserver adds requesting device to "inventory", and shows it in GUI, but doesn't use it unless it was already in this game, and is just now reconnecting from some power failure, etc.
    * if there are two unique D3vice networks on the same LAN, the node would connect to the first one it found. An admin could use the GUI to change the network a node is paired with.
* Polls gameserver IPNS gateway every n seconds, looking for instructions, and game events to react to.

#### Bootstrap process

*DEPRECATED BECAUSE IPFS TOO SLOW FOR THIS USE CASE*

from a clean state. Unaware of any network.

* boot up
* find gameserver IP
* GET gameserver:80/api/v1/network/address
    => 'QmVXFG62Kbfd3H7dt5sRGGQ1yQr11AbTMdFVwTiwMNcKNS'
  * gameserver returns IPNS name for this network
* Store IPNS name in non-volatile memory. (will be used next boot)
* GET gameserver:4001/ipns/QmVXFG62Kbfd3H7dt5sRGGQ1yQr11AbTMdFVwTiwMNcKNS
  => `{
    "meta": {
      "version": 3,
      "type": "D3vice Network",
      "name": "Doom Squad Airsoft D3vice Test Net"
    },

    "networkState": [
      {"event": "creation", "time": 1455276025696},
      {"event": "gameStart", "time": 1455278488933, "ipns": "QmRsdJRzThaLY57hp3hWZJpottapb4UXYvwNWWXNngurpu"}
    ]
  }`
* determne whether or not a game is in progress, based on network events. In this example, a game is in progress, so the next step is to get details of that game
* GET gameserver:4001/ipns/QmRsdJRzThaLY57hp3hWZJpottapb4UXYvwNWWXNngurpu
  => `{
    "meta": {
      "version": 4,
      "type": "D3vice Game",
      "ipns": "QmRsdJRzThaLY57hp3hWZJpottapb4UXYvwNWWXNngurpu"
    },
    "gameState": [
      {
        "event": "start",
        "time": 1455278488933,
        "params": {
          "mode": 3,
          "timeLimit": 1800000,
          "orders": {
            1:
          }
        }
      }, {
        "event": "buttonPress",
        "time": 1455278924048,
        "params": {
          "node": 1,
          "button": 3
        }
      }, {
        "event": "buttonPress",
        "time": 1455278924048,
        "params": {
          "node": 1,
          "button": 4
        }
      }
    ]
  }`
* now this D3vice node knows the game state and can take part, doing it's designated tasks.



### gameserver

#### Gameserver one-time setup

*DEPRECATED BECAUSE IPFS TOO SLOW FOR THIS USE CASE*

Each unique D3vice network needs one IPNS address that doesn't change. This is so D3vice nodes can always refer to this IPNS address to see the state of the network. In other words, when a D3vice node starts up, it shouldn't have to discover an IPNS address, it should just remember it, save it in EEPROM or something.

It would start up, and REST GET the unique network IPNS address. This would return JSON:

```json
{
  "meta": {
    "version": 1,
    "type": "D3vice Network",
    "name": "Doom Squad Airsoft D3vice Test Net"
  },

  "networkState": [
    {"event": "creation", "time": 1455276025696},
    {
      "event": "gameStart",
      "time": 1455278488933,
      "ipns": "QmRsdJRzThaLY57hp3hWZJpottapb4UXYvwNWWXNngurpu"
    }
  ]
}
```

#### Gameserver bootstrapping

*DEPRECATED BECAUSE IPFS TOO SLOW FOR THIS USE CASE*

when teh gameserver starts a game

* create an IPNS address
* create json file for this game

```json
{
  "meta": {
    "version": 1,
    "type": "D3vice Game",
    "ipns": "QmRsdJRzThaLY57hp3hWZJpottapb4UXYvwNWWXNngurpu"
  },
  "gameState": [
    {
      "event": "start",
      "time": 1455278488933,
      "params": {
        "mode": 3,
        "timeLimit": 1800000,
        "playbook": [
          {"node": 1, "mode": "capturePoint"},
          {"node": 2, "mode": "pyroArtillery"}
        ]
      }
    }, {
      "event": "buttonPress",
      "time": 1455278924048,
      "params": {
        "node": 1,
        "button": 3
      }
    }, {
      "event": "buttonPress",
      "time": 1455278924048,
      "params": {
        "node": 1,
        "button": 4
      }
    }
  ]
}
```

* `ipfs add` the json file, and add the multihash returned from `ipfs add` to the ipns name for this game
