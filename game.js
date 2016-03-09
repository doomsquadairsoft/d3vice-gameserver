/*


                              ------- node
                            /
              rabbitMQ ---------- node
                  |       \
                  |        -------- node
                  |
              gameServer
                  |
                  |
      db ---- apiServer
                  |
                  |
               client

 */


/**
 * Game function
 *
 * @param {Fortune} app
 */
var Game = function Game(app) {
  // is game running?
  console.log('gaem starte');
  app.request({
    method: 'find',
    type: 'game-type',
    ids: 1,
  })
  .then(function(data) {
    console.log(data);
  });
  //read game.status => (running | paused | ended | won)
}






// program start
//   is game running?
//     read game.status => (running | paused | ended | won)
//
//   if game is running (not paused)
//     wait for event reports
//     run ticker every millisecond
//
//       increment the amount of time the game has been running
//         game.gameConfig.time.elapsed += 1000
//
//       determine if the game time limit has elapsed
//         read game.gameConfig.time.limit
//           compare to game.gameConfig.time.elapsed
//
//       determine if the game end time has been reached
//         read game.gameConfig.time.end
//           if Date() > game.gameConfig.time.end
//             choose winner, end game.
//
//
//
//
//
//       if game mode is domination
//         increment counter for the team that is controlling the point
//
//       if game mode is intel
//
//       if game mode is bomb
//         if bomb is disarmed
//           make bomb not planted
//
//         if bomb is planted
//           decrement bomb timer
//
//
//
//
//   if game is not running
//     wait for event reports
//








/**********
 *
 *
 *
 *
 *
 *
 * program start
 *
 *
 *
 *
 *
 */

// is game running?
//game.status => (running | paused | ended | won)












//
//
//
// // set up api client
// var JSONAPIClient = require('json-api-client');
//
// var PATH_TO_API_ROOT = 'http://127.0.0.1:1337/'
//
// var DEFAULT_HEADERS = {
//   'Content-Type': 'application/json',
//   'Accept': 'application/vnd.api+json; version=1'
//  }
//
// var client = new JSONAPIClient(PATH_TO_API_ROOT, DEFAULT_HEADERS)
//
//
//
//
//
// client.type('node').get(['1', '2', '3']).then(function(err, nodes) {
//   console.log(err);
//   console.log(nodes);;
// });
//
//
//  // // Create a resource
//  // var brian = client.type('people').create({name: 'Brian'}).then(function(err, idk) {
//  //   console.log(err);
//  //   console.log(idk);
//  // });
//  //
//  // # Change a resource (locally)
//  // brian.update name: 'Brian C.'
//  //
//  // # Save a resource to the server
//  // brian.save()
//  //
//  // # Delete a resource from the server
//  // brian.delete()
//


module.exports = Game;
