

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
  /*
  const query = new Parse.Query("Post");
  query.get(request.object.get("post").id)
    .then(function(post) {
      post.increment("comments");
      return post.save();
    })
    .catch(function(error) {
      console.error("Got an error " + error.code + " : " + error.message);
    });
    */
});