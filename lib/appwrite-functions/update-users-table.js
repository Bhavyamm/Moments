import * as sdk from "node-appwrite";

const client = new sdk.Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const database = new sdk.Databases(client);

export default async function (req, res) {
  try {
    const payload = req.payload;
    const userId = payload["$id"];
    const email = payload["$identifiers"];
    const name = payload["$name"];

    const promise = database.createDocument(
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
}
