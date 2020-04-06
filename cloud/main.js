

Parse.Cloud.define('hello', function(req, res) {
  return 'Hello! I am a parse function call on the server.';
});


function processOneGame(rows) {
  let map = new Map()
  var len = rows.length
  for(let i =0; i < rows.length; ++i) {
    var row = rows[i]
    var usr = row.get("username")
    if(""==usr)
      continue
    var choice = row.get("choice")
    console.log("row: usr=" + usr + " choice=" + choice)
    map.set(usr, choice)
  }
      
  // There may have been more than 2 users, but...that should not happen
    
  // Yes, we may complete the game
  var usr1, choice1, usr2, choice2
  var k = 0;
  for(let item of map[Symbol.iterator]()) {
    ++k
      if(1 == k) {
        usr1 = item[0]
        choice1 = item[1]
      }
      else {
        usr2 = item[0]
        choice2 = item[1]
      }
  }
    
  // Resolve the game logic
  var winner
  if(choice1=="rock" && choice2=="rock")
    winner = "draw"
  else if(choice1=="rock" && choice2=="paper")
    winner = usr2
  else if(choice1=="rock" && choice2=="scissors")
    winner = usr1
  else if(choice1=="paper" && choice2=="rock")
    winner = usr1
  else if(choice1=="paper" && choice2=="paper")
    winner = "draw"
  else if(choice1=="paper" && choice2=="scissors")
    winner = usr2
  else if(choice1=="scissors" && choice2=="rock")
    winner = usr2
  else if(choice1=="scissors" && choice2=="paper")
    winner = usr1
  else if(choice1=="scissors" && choice2=="scissors")
    winner = "draw"

  var gameId = rows[0].get("gameId")
  console.log("gameId=" + gameId + "  winner="  + winner)

  // Write the result for the game to the Winner table
  var WinnerTable = Parse.Object.extend("Winner");
  var winnerTable = new WinnerTable();
  winnerTable.set("gameId", gameId)
  winnerTable.set("winner", winner)
  winnerTable.set("usr1", usr1)
  winnerTable.set("choice1", choice1)
  winnerTable.set("usr2", usr2)
  winnerTable.set("choice2", choice2)
  winnerTable.save() // async!

  // Remove the 
}


Parse.Cloud.afterSave("GameV1", (request) => {
  console.log("GameV1 afterSave function triggered")

  // We are going to process ALL existing games, so get the whole table
  // and presort them into groups by gameId
  const query = new Parse.Query("GameV1");
  const gameRows = query.find().then(function(gameRows) {
    let mapGameIDs = new Map()
    var len = gameRows.length
    for(let i =0; i < gameRows.length; ++i) {
      var row = gameRows[i]
      var gameId = row.get("gameId")

      if(!mapGameIDs.has(gameId))
        mapGameIDs.set(gameId, new Array())
      
      var arr = mapGameIDs.get(gameId)
      arr.push(row)
      mapGameIDs.set(gameId, arr)
    }

    for (let [gamdId, arr] of mapGameIDs) 
      processOneGame(arr)      

    // We have processed all entries, remove them
    Parse.Object.destroyAll(gameRows).then(function(removed) {
      console.log("removed rows from GameV1 table")
    })
    
  })
})

/*
  // Get the choices from the table
  const query = new Parse.Query("GameV1");
  const resultsS = query.find().then(function(results) {
    let map = new Map()
    var len = results.length
    for(let i =0; i < results.length; ++i) {
      var row = results[i]
      var usr = row.get("username")
      if(""==usr)
        continue
      var choice = row.get("choice")
      console.log("row: usr=" + usr + " choice=" + choice)
      map.set(usr, choice)
      
      // Do we have choices from two unique users? (hacky)
      if(map.size != 2) 
        continue // not yet
        
      // Yes, we may complete the game
      var usr1, choice1, usr2, choice2
      var k = 0;
      for(let item of map[Symbol.iterator]()) {
        ++k
          if(1 == k) {
            usr1 = item[0]
            choice1 = item[1]
          }
          else {
            usr2 = item[0]
            choice2 = item[1]
          }
      }
      
      // Resolve the game logic
      var winner
      if(choice1=="rock" && choice2=="rock")
        winner = "draw"
      else if(choice1=="rock" && choice2=="paper")
        winner = usr2
      else if(choice1=="rock" && choice2=="scissors")
        winner = usr1
      else if(choice1=="paper" && choice2=="rock")
        winner = usr1
      else if(choice1=="paper" && choice2=="paper")
        winner = "draw"
      else if(choice1=="paper" && choice2=="scissors")
        winner = usr2
      else if(choice1=="scissors" && choice2=="rock")
        winner = usr2
      else if(choice1=="scissors" && choice2=="paper")
        winner = usr1
      else if(choice1=="scissors" && choice2=="scissors")
        winner = "draw"

      console.log("winner: " + winner)
      
      // Remove all the entries from the table
      query.find().then(function(results) {
        return Parse.Object.destroyAll(results);
      }).then(function() {
        console.log("emptied game table")
      }, function(error) {
        console.log("ERROR: while trying to empty game table")
      });

      // Empty the Winner table
      const queryWinners = new Parse.Query("Winner");
      queryWinners.find().then(function(allWinners) {
        return Parse.Object.destroyAll(allWinners);
      }).then(function() {
        console.log("emptied Winner table")
      }, function(error) {
        console.log("ERROR: while trying to empty Winner table")
      });

      // Write the result to the Winner table
      var WinnerTable = Parse.Object.extend("Winner");
      var winnerTable = new WinnerTable();
      winnerTable.set("winner", winner)
      winnerTable.set("usr1", usr1)
      winnerTable.set("choice1", choice1)
      winnerTable.set("usr2", usr2)
      winnerTable.set("choice2", choice2)
      winnerTable.save().then(function() {
        console.log("saved changes to winner table")
      })

      console.log("Game has been resolved")
      return;
    }

    console.log("no winner yet")
  })
  .catch(function(error) {
    console.error("Got an error " + error.code + " : " + error.message);
  });

  
    
});
*/