

Parse.Cloud.define('hello', function(req, res) {
  return 'Hello! I am a parse function call on the server.';
});


function processOneGame(rows) {
  var gameId = rows[0].get("gameId")
  console.log("Processing choices for game + " + gameId)
  let map = new Map()
  var len = rows.length
  if(1 == len) {
    console.log("game + " + gameId + " is not complete (A)")
    return
  }
  for(let i =0; i < rows.length; ++i) {
    var row = rows[i]
    var usr = row.get("username")
    if(""==usr)
      continue
    var choice = row.get("choice")
    console.log("row: usr=" + usr + " choice=" + choice)
    map.set(usr, choice)
  }
  
  if(map.size < 2) {
    console.log("game + " + gameId + " is not complete (B)")
    return
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

  // We have processed all entries, remove them
  Parse.Object.destroyAll(rows).then(function(removed) {
    console.log("removed rows from GameV1 table for gameId " + gameId)
  })
  
  console.log("game " + gameId + " is complete")
}


Parse.Cloud.afterSave("GameV1", (request) => {
  console.log("GameV1 afterSave function triggered")

  // We are going to process ALL existing games, so get the whole table
  // and presort them into groups by gameId
  const query = new Parse.Query("GameV1");  
  console.log("Running query on GameV1")
  const gameRows = query.find().then(function(gameRows) {
    console.log("parsing query on GameV1")
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
      console.log("GameV1 afterSave function completed")
  }, function(e) {
    // not called
    console.error('parse query rejected', e);
  })
})
