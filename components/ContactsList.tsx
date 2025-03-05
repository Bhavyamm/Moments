import {
  createFriendRequest,
  getUserByPhoneNumber,
  checkFriendshipStatus,
} from "@/lib/appwrite";
import {
  Alert,
  Image,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import * as Contacts from "expo-contacts";
import * as SMS from "expo-sms";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";

interface ContactWithStatus extends Contacts.Contact {
  friendshipStatus?: "none" | "pending" | "accepted";
}

interface ContactsProps {
  userId: string;
  onFriendStatusChange?: () => void;
}

export default function ContactsList({
  userId,
  onFriendStatusChange,
}: ContactsProps) {
  const [contacts, setContacts] = useState<ContactWithStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.Name,
            Contacts.Fields.Image,
            Contacts.Fields.PhoneNumbers,
          ],
        });

        if (data.length > 0) {
          const contactsWithStatus = await Promise.all(
            data.map(async (contact) => {
              const phoneNumber = contact?.phoneNumbers?.[0]?.number;
              if (phoneNumber) {
                try {
                  const friend = await getUserByPhoneNumber(
                    phoneNumber.slice(3)
                  );
                  if (friend.success && friend.user) {
                    const friendshipStatus = await checkFriendshipStatus(
                      userId,
                      friend.user.$id
                    );
                    return {
                      ...contact,
                      friendshipStatus: friendshipStatus?.status,
                    };
                  }
                } catch (error) {
                  console.error("Error checking friendship status:", error);
                }
              }
              return { ...contact, friendshipStatus: "none" };
            })
          );
          setContacts(contactsWithStatus);
        }
      } else {
        console.log("Contacts permission not granted");
        Alert.alert(
          "Permission Required",
          "Please allow access to your contacts to use this feature."
        );
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
      Alert.alert("Error", "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadContacts();
    }
  }, [userId]);

  const handleAddContact = async (contact: ContactWithStatus) => {
    const phoneNumber = contact?.phoneNumbers?.[0]?.number;
    if (!phoneNumber) {
      Alert.alert("Error", "No phone number available");
      return;
    }

    const friend = await getUserByPhoneNumber(phoneNumber.slice(3));

    const deepLinkUrl = Linking.createURL("/", {
      queryParams: { friendId: friend?.user?.$id, userId: userId },
    });

    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("SMS Not Available", "Your device does not support SMS");
      return;
    }

    const message = `Hey, I'd like to add you as a friend on Memories! Tap here to accept: ${deepLinkUrl}`;
    const recipients = [phoneNumber];

    try {
      const { result } = await SMS.sendSMSAsync(recipients, message);

      if (friend.success && friend.user && result === "sent") {
        const response = await createFriendRequest(userId, friend?.user?.$id);

        if (response) {
          Alert.alert("Success", "Friend request sent successfully");
          setContacts((prevContacts) =>
            prevContacts.map((c) =>
              c.id === contact.id ? { ...c, friendshipStatus: "pending" } : c
            )
          );

          if (onFriendStatusChange) {
            onFriendStatusChange();
          }
        } else {
          Alert.alert("Error", "Failed to send friend request");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send SMS");
      console.error(error);
    }
  };

  const renderContactItem = ({ item }: { item: ContactWithStatus }) => {
    return (
      <View className="flex-row items-center py-4 border-b border-gray-800">
        {item.imageAvailable && item.image?.uri ? (
          <Image
            source={{
              uri: item.image.uri.startsWith("/")
                ? `file://${item.image.uri}`
                : item.image.uri,
            }}
            className="w-12 h-12 rounded-full mr-4"
          />
        ) : (
          <View className="w-12 h-12 rounded-full mr-4 bg-gray-700 items-center justify-center">
            <Text className="text-white text-lg font-montserrat-medium">
              {item.name && item.name.charAt(0)}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="text-white font-montserrat-medium">{item.name}</Text>
          <Text className="text-gray-400 text-sm">
            {item.phoneNumbers && item.phoneNumbers[0]?.number}
          </Text>
        </View>

        {/* Status Buttons */}
        {item.friendshipStatus === "pending" ? (
          <View className="bg-yellow-100/20 px-3 py-2 rounded-lg flex-row items-center">
            <Feather name="clock" size={16} color="#FDECAF" />
            <Text className="text-yellow-100 font-montserrat-medium ml-2">
              Pending
            </Text>
          </View>
        ) : item.friendshipStatus === "accepted" ? (
          <View className="bg-[#00E5FF]/20 px-3 py-2 rounded-lg flex-row items-center">
            <Feather name="check" size={16} color="#00E5FF" />
            <Text className="text-[#00E5FF] font-montserrat-medium ml-2">
              Friends
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => handleAddContact(item)}
            className="bg-primary-100/20 px-3 py-2 rounded-lg flex-row items-center"
          >
            <Feather name="user-plus" size={16} color="#475867" />
            <Text className="text-primary-100 font-montserrat-medium ml-2">
              Add
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-montserrat-bold text-white">
          Phone Contacts
        </Text>
        <TouchableOpacity onPress={loadContacts}>
          <Feather name="refresh-cw" size={18} color="#00E5FF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#00E5FF" size="large" />
          <Text className="text-gray-400 font-montserrat mt-4">
            Loading contacts...
          </Text>
        </View>
      ) : contacts.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Feather name="users" size={48} color="#333" />
          <Text className="text-gray-400 font-montserrat mt-4 text-center">
            No contacts found or permission denied.
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          renderItem={renderContactItem}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
