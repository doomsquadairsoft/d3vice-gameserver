# d3vice-gameserver [![Build Status](https://travis-ci.org/doomsquadairsoft/d3vice-gameserver.svg?branch=master)](https://travis-ci.org/doomsquadairsoft/d3vice-gameserver) [![Inline docs](http://inch-ci.org/github/doomsquadairsoft/d3vice-gameserver.svg?branch=master)](http://inch-ci.org/github/doomsquadairsoft/d3vice-gameserver)
Code which runs the game.

* game logic handled by node
* state stored in redis
* communication between D3vice nodes handled by RabbitMQ (MQTT) pub/sub
* api data served to client via express


## Installation

Install system dependencies

    apt-get install git festival festvox-kallpc16k


Clone this repo if you haven't already

    git clone https://github.com/doomsquadairsoft/d3vice-gameserver
    cd d3vice-gameserver


Install node

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
    nvm install v4.6,2


Install node dependencies


    nvm install



## Running the program

There are multiple ways to do this, depending on how your hardware is configured. Run the server and the client on one device if you want, or run the server on one d3vice and the client on another. For example, here's how you can run the client ans server on one device, and manage the two separate node instances with `foreman`.

First, create a `.env` file with any Environment variables you need. (advanced. not required.)

Next, create a `Procfile` which details your desired setup. In this example, we have one device running the server and the client. The hardware configuration of this d3vice is a twobutton (red team/green team) box with neopixels and a 3.5mm speaker output.

    // Procfile

    gameserver: node server.js
    playerInput: node client-twobutton-pa.js


now simply start the processes using nf


    ./node_modules/foreman/bin/nf.js start


note: you can make the above line easier to call if you install foreman globally using `npm install -g foreman`. That would allow you to start the processes using:

    nf start







## Environment variables

can be env vars or saved in `config.json`

```json
{
  "D3VICE_"
  "REDIS_HOST": "",
  "REDIS_PORT": "",
  "REDIS_PASSWORD": "",
  "REDIS_USERNAME": ""
}
```

## Notes/Brainstorming



### esp8266 or other low-memory D3vice node

This is any D3vice on the network that can't run IPFS, and how it gets it's game data

* Starts up
* acquires own IP address
* Finds IP address of gameserver
  * multicast request?
  * DNS? (probably not, since d3vice-gameserver is supposed to work in remote areas *and* in existing LANs)
  * UDP discovery method
* Does RESTful request to gameserver that says, "I am here"
  * gameserver creates timestamped node discovery event in gameState
  * gameserver adds requesting device to "inventory", and shows it in GUI, but doesn't use it unless it was already in this game, and is just now reconnecting from some power failure, etc.
    * if there are two unique D3vice networks on the same LAN, the node would connect to the first one it found. An admin could use the GUI to change the network a node is paired with.
* Polls gameserver every n seconds, looking for instructions, and game events to react to.

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





## Socket Adapter information

On either side of the system, an Adapter class is used to bind game data to a socket. On the client side, the adapter is used adapt an input to a socket. On the server side, the adapter is used to adapt a socket to a game.



```
     Client                  Server
input <-> socket        socket <-> game

```



# Hardware

## OrangePi One

The original design target.

### Setup steps

  * Add a wifi dongle & configure to automatically join a D3VICE Wifi network.
  * enable GPIO kernel module by adding `gpio-sunxi` to /etc/modules



# Credits

## Images

https://forum.armbian.com/index.php/topic/759-tutorial-i2s-on-orange-pi-h3/


## Sounds

domination.wav by Katarina Rose https://freesound.org/people/womb_affliction/sounds/330706/ (CC BY 3.0)
all other sounds (CC0)
