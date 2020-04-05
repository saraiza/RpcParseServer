

Parse.Cloud.define('hello', function(req, res) {
  return 'Hello! I am a parse function call on the server.';
});


Parse.Cloud.define('checkgame', function(req, res) {
  return 'game was processed';
});


Parse.Cloud.afterSave("GameScore", (request) => {
  console.log("GameScore afterSave function triggered")
});

Parse.Cloud.afterSave("User", (request) => {
  console.log("User afterSave function triggered")
});

Parse.Cloud.afterSave("GameV1", (request) => {
  console.log("GameV1 afterSave function triggered")

  var FooBar = Parse.Object.extend("FooBar");
  var fooBar = new FooBar();
  fooBar.destroy().then((foos)=> {
    console.log("foos d")
  })

  
  const query = new Parse.Query("GameV1");
  
  // 
  const results = query.find().then(function(results) {
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
      // Add one entry with the result
      
      var Game = Parse.Object.extend("Winner");
      var game = new Game();
      game.set("username", winner)
      game.save()

      return;
    }
  })
  .catch(function(error) {
    console.error("Got an error " + error.code + " : " + error.message);
  });

  
    
});