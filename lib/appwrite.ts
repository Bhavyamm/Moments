import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  OAuthProvider,
  Query,
  Storage,
} from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const config = {
  platform: "com.bhavyam.memories",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  usersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
  friendshipsCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_FRIENDSHIPS_COLLECTION_ID,
  imagesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_IMAGES_COLLECTION_ID,
  imagesBucketId: process.env.EXPO_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
};

export const getClient = () => {
  const client = new Client();
  client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform);
  return client;
};

export let client = getClient();
export let databases = new Databases(client);
export let avatar = new Avatars(client);
export let account = new Account(client);
export let storage = new Storage(client);

export const resetClients = async () => {
  client = getClient();
  databases = new Databases(client);
  avatar = new Avatars(client);
  account = new Account(client);

  await AsyncStorage.removeItem("authSession");
};

export async function login() {
  try {
    await resetClients();

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

    const jwtResponse = await account.createJWT();
    console.log("JWT Response:", jwtResponse);
    if (!jwtResponse || !jwtResponse.jwt)
      throw new Error("Failed to create JWT");

    client.setJWT(jwtResponse.jwt);

    return true;
  } catch (error) {
    console.error(error);
    await resetClients();
    return false;
  }
}

export async function logout() {
  try {
    const result = await account.deleteSession("current");
    await resetClients();
    return result;
  } catch (error) {
    console.error(error);
    await resetClients();
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

export const getUserById = async (userId: string) => {
  try {
    const user = await databases.getDocument(
      config.databaseId!,
      config.usersCollectionId!,
      userId
    );

    return user;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
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
    const friendships = await databases.listDocuments(
      config.databaseId!,
      config.friendshipsCollectionId!,
      [Query.search("requester_id", userId), Query.search("status", "accepted")]
    );

    const friends = friendships.documents.map((friendship) => {
      return friendship.requested_id;
    });

    if (friends.length === 0) {
      return [];
    }

    const userPromises = friends.map((friendId) =>
      databases
        .getDocument(config.databaseId!, config.usersCollectionId!, friendId)
        .catch((error) => {
          console.error(`Error fetching user with ID ${friendId}:`, error);
          return null;
        })
    );

    const usersResults = await Promise.all(userPromises);

    const users = usersResults.filter((user) => user !== null);

    return users;
  } catch (error) {
    console.error("Error getting friends by user ID:", error);
    return [];
  }
};

export const uploadImage = async (file: {
  name: string;
  type: string;
  uri: string;
}) => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    const response = await storage.createFile(
      config.imagesBucketId!,
      ID.unique(),
      {
        name: file.name,
        type: file.type,
        size: 0,
        uri: file.uri,
      }
    );

    if (!response) {
      throw new Error("File upload failed");
    }

    return response;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const createImageMetadata = async (
  imageId: string,
  senderId: string,
  recipient_id: string
) => {
  try {
    const response = await databases.createDocument(
      config.databaseId!,
      config.imagesCollectionId!,
      ID.unique(),
      {
        image_id: imageId,
        sender_id: senderId,
        recipient_id: recipient_id,
      }
    );
    return response;
  } catch (error) {
    console.error("Error creating image metadata:", error);
    return null;
  }
};

export const getUnViewedImages = async (userId: string) => {
  try {
    const images = await databases.listDocuments(
      config.databaseId!,
      config.imagesCollectionId!,
      [Query.search("recipient_id", userId)]
    );

    const unViewedImages = images.documents.filter((image) => {
      return !image.is_viewed;
    });

    return unViewedImages;
  } catch (error) {
    console.error("Error fetching unviewed images:", error);
    return [];
  }
};

export const getImageFromStorage = async (fileId: string) => {
  try {
    const response = await storage.getFileView(config.imagesBucketId!, fileId);
    return response;
  } catch (error) {
    console.error("Error getting image from storage:", error);
    return null;
  }
};

export const updateImageViewedStatus = async (
  imageId: string,
  recipientId: string
) => {
  try {
    const images = await databases.listDocuments(
      config.databaseId!,
      config.imagesCollectionId!,
      [
        Query.equal("image_id", imageId),
        Query.equal("recipient_id", recipientId),
      ]
    );

    if (images.total === 0) {
      throw new Error("Image not found");
    }

    const response = await databases.updateDocument(
      config.databaseId!,
      config.imagesCollectionId!,
      images.documents[0].$id,
      {
        is_viewed: true,
        viewed_at: new Date().toISOString(),
      }
    );

    return response;
  } catch (error) {
    console.error("Error marking image as viewed:", error);
    return null;
  }
};
