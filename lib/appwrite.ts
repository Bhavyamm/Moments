import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  OAuthProvider,
  Query,
} from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";

export const config = {
  platform: "com.bhavyam.memories",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  usersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
  friendshipsCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_FRIENDSHIPS_COLLECTION_ID,
};

export const client = new Client();
export const databases = new Databases(client);

client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform);

export const avatar = new Avatars(client);
export const account = new Account(client);

export async function login() {
  try {
    const redirectUri = Linking.createURL("/");
    console.log("Redirect URI:", redirectUri);

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );

    console.log(response, "response");

    if (!response) throw new Error("Create OAuth2 token failed");

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );

    console.log(browserResult, "browserResult");

    if (browserResult.type !== "success")
      throw new Error("Create OAuth2 token failed");

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();
    if (!secret || !userId) throw new Error("Create OAuth2 token failed");

    const session = await account.createSession(userId, secret);
    console.log("Session:", session);

    if (!session) throw new Error("Failed to create session");

    // Generate a JWT for the current session
    const jwtResponse = await account.createJWT();
    console.log("JWT Response:", jwtResponse);
    if (!jwtResponse || !jwtResponse.jwt)
      throw new Error("Failed to create JWT");

    // Set the JWT so that subsequent API calls are authenticated
    client.setJWT(jwtResponse.jwt);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function logout() {
  try {
    const result = await account.deleteSession("current");
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const result = await account.get();
    if (result.$id) {
      const userAvatar = avatar.getInitials(result.name);

      return {
        ...result,
        avatar: userAvatar.toString(),
      };
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const createFriendRequest = async (userId: string, friendId: string) => {
  try {
    const response = await databases.createDocument(
      config.databaseId!,
      config.friendshipsCollectionId!,
      userId,
      {
        requester_id: userId,
        requested_id: friendId,
        status: "pending",
        last_interacted_at: new Date().toISOString(),
      }
    );

    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserByPhoneNumber = async (phoneNumber: string) => {
  try {
    const users = await databases.listDocuments(
      config.databaseId!,
      config.usersCollectionId!,
      [Query.equal("phone_number", phoneNumber)]
    );

    console.log(users, "users");

    if (users.total === 0) {
      return { success: false, message: "User not found" };
    }

    return {
      success: true,
      user: users.documents[0],
    };
  } catch (error) {
    console.error("Error finding user by phone number:", error);
    return { success: false, error: error };
  }
};

export const checkFriendshipStatus = async (
  userId: string,
  friendId: string
) => {
  try {
    const friendships = await databases.listDocuments(
      config.databaseId!,
      config.friendshipsCollectionId!,
      [
        Query.search("requester_id", userId),
        Query.search("requested_id", friendId),
      ]
    );

    if (friendships.total === 0) {
      return { areFriends: false, status: "none" };
    }

    const friendship = friendships.documents[0];

    return {
      areFriends: friendship.status === "accepted",
      status: friendship.status,
    };
  } catch (error) {
    console.error("Error checking friendship status:", error);
    return { areFriends: false, error: error };
  }
};

export const updateFriendshipStatus = async (
  userId: string,
  status: string
) => {
  try {
    const response = await databases.updateDocument(
      config.databaseId!,
      config.friendshipsCollectionId!,
      userId,
      {
        status,
      }
    );

    return response;
  } catch (error) {
    console.error("Error updating friendship status:", error);
    return null;
  }
};

export const getFriendsByUserId = async (userId: string) => {
  try {
    console.log(userId, "userId");

    const friendships = await databases.listDocuments(
      config.databaseId!,
      config.friendshipsCollectionId!,
      [Query.search("requester_id", userId), Query.search("status", "accepted")]
    );

    console.log(friendships, "friendships");

    const friends = friendships.documents.map((friendship) => {
      return friendship.requested_id;
    });

    if (friends.length === 0) {
      return [];
    }

    // Fetch each user individually and collect results
    const userPromises = friends.map((friendId) =>
      databases
        .getDocument(config.databaseId!, config.usersCollectionId!, friendId)
        .catch((error) => {
          console.error(`Error fetching user with ID ${friendId}:`, error);
          return null;
        })
    );

    // Wait for all promises to resolve
    const usersResults = await Promise.all(userPromises);

    // Filter out any null results from failed requests
    const users = usersResults.filter((user) => user !== null);

    return users;
  } catch (error) {
    console.error("Error getting friends by user ID:", error);
    return [];
  }
};
