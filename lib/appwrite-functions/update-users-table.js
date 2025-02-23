const sdk = require("node-appwrite");

let client = new sdk.Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

let database = new sdk.Databases(client);

module.exports = async (req, res) => {
  try {
    let payload = req.payload;
    let userId = payload["$id"];
    let email = payload["$identifiers"];
    let name = payload["$name"];

    let promise = database.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      userId,
      {
        user_id: userId,
        email: email,
        name: name,
        profile_picture: "",
      }
    );
    promise.then(
      function (response) {
        res.send(response);
      },
      function (error) {
        res.send(error);
      }
    );
  } catch (error) {
    res.send({ error: error.message });
  }
};
