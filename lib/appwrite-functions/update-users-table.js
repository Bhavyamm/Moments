import * as sdk from "node-appwrite";

const client = new sdk.Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const database = new sdk.Databases(client);

const updateUsersTable = async (req, res) => {
  try {
    context.log(req, "request");
    const payload = req.payload;
    context.log(payload, "payload");
    const userId = payload["$id"];
    const email = payload["$identifiers"];
    const name = payload["$name"];

    const response = await database.createDocument(
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
    console.log(response);
    res.send(response);
  } catch (error) {
    console.error(error);
    res.send({ error: error.message });
  }
};

export default updateUsersTable;
