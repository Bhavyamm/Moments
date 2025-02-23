import * as sdk from "node-appwrite";

// Initialize Appwrite client
const client = new sdk.Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // e.g. "https://cloud.appwrite.io/v1"
  .setProject(process.env.APPWRITE_PROJECT_ID) // Your Project ID
  .setKey(process.env.APPWRITE_API_KEY); // Your API Key

const database = new sdk.Databases(client);

const updateUsersTable = async (req, res, context) => {
  // Use context.log and context.error if available
  const log = context?.log || console.log;
  const errorLog = context?.error || console.error;

  try {
    log("Full request object:", req);

    // Extract the inner request object if it's nested in req.req
    const request = req.req ? req.req : req;

    // Retrieve payload from multiple possible locations
    let payload =
      request.payload ||
      request.bodyJson ||
      request.body ||
      process.env.APPWRITE_FUNCTION_DATA;
    log("Raw payload:", payload);

    if (!payload) {
      throw new Error("No payload received");
    }

    // If payload is a string, try to parse it
    if (typeof payload === "string") {
      if (payload.trim() === "") {
        throw new Error("Empty payload string received");
      }
      try {
        payload = JSON.parse(payload);
      } catch (parseError) {
        throw new Error("Invalid JSON payload: " + payload);
      }
    }

    log("Parsed payload:", payload);

    // Extract required user fields from payload
    const userId = payload["$id"];
    const email = payload["$identifiers"];
    const name = payload["$name"];

    if (!userId || !email || !name) {
      throw new Error("Missing required user fields in payload");
    }

    // Create a document in your custom Users collection
    const response = await database.createDocument(
      process.env.APPWRITE_DATABASE_ID, // Your database ID
      process.env.APPWRITE_USERS_COLLECTION_ID, // Your Users collection ID
      userId, // Use user ID as the document ID
      {
        user_id: userId,
        email: email,
        name: name,
        profile_picture: "", // Default empty value
      }
    );

    res.send(response);
  } catch (err) {
    errorLog("Error:", err);
    res.send({ error: err.message });
  }
};

export default updateUsersTable;
