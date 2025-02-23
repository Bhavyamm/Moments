import * as sdk from "node-appwrite";

// Initialize Appwrite client
const client = new sdk.Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // e.g., "https://cloud.appwrite.io/v1"
  .setProject(process.env.APPWRITE_PROJECT_ID) // Your Project ID
  .setKey(process.env.APPWRITE_API_KEY); // Your API Key

const database = new sdk.Databases(client);

const updateUsersTable = async (req, res) => {
  try {
    console.log("Full request object:", req);

    // Try to get payload from req.payload, req.body or APPWRITE_FUNCTION_DATA
    let payload = req.payload || req.body || process.env.APPWRITE_FUNCTION_DATA;
    console.log("Raw payload:", payload);

    if (!payload) {
      throw new Error("No payload received");
    }

    // If the payload is a string, ensure it's valid JSON
    if (typeof payload === "string") {
      if (payload.trim() === "") {
        throw new Error("Empty payload string received");
      }
      try {
        payload = JSON.parse(payload);
      } catch (err) {
        throw new Error("Invalid JSON payload: " + payload);
      }
    }

    console.log("Parsed payload:", payload);

    // Extract required user fields
    const userId = payload["$id"];
    const email = payload["$identifiers"];
    const name = payload["$name"];

    if (!userId || !email || !name) {
      throw new Error("Missing required user fields in payload");
    }

    // Create a document in the custom users collection
    const response = await database.createDocument(
      process.env.APPWRITE_DATABASE_ID, // Your database ID
      process.env.APPWRITE_USERS_COLLECTION_ID, // Your users collection ID
      userId, // Use the user ID as the document ID
      {
        user_id: userId,
        email: email,
        name: name,
        profile_picture: "", // Default value; update as needed
      }
    );

    res.send(response);
  } catch (error) {
    console.error("Error:", error);
    res.send({ error: error.message });
  }
};

export default updateUsersTable;
