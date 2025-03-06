import {
  createFriendRequest,
  getUserByPhoneNumber,
  checkFriendshipStatus,
} from "@/lib/appwrite";
import {
  Image,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
} from "react-native";
import * as Contacts from "expo-contacts";
import * as SMS from "expo-sms";
import * as ExpoLinking from "expo-linking";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { GRANTED, SENT } from "@/constants/constants";
import { useAlert } from "@/lib/alert-context";

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
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  const { showAlert } = useAlert();

  const requestContactsPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      console.log(status, "status");
      setPermissionStatus(status);

      if (status === GRANTED) {
        fetchContacts();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error requesting contacts permission:", error);
      setLoading(false);
      showAlert("error", "Failed to request contacts permission");
    }
  };

  const fetchContacts = async () => {
    try {
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
                const friend = await getUserByPhoneNumber(phoneNumber.slice(3));
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
    } catch (error) {
      console.error("Error fetching contacts:", error);
      showAlert("error", "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    setLoading(true);
    const { status } = await Contacts.getPermissionsAsync();
    setPermissionStatus(status);

    if (status === GRANTED) {
      fetchContacts();
    } else {
      requestContactsPermission();
    }
  };

  const openSettings = () => {
    Linking.openSettings().catch(() => {
      showAlert("error", "Unable to open settings");
    });
  };

  useEffect(() => {
    if (userId) {
      loadContacts();
    }
  }, [userId]);

  const handleAddContact = async (contact: ContactWithStatus) => {
    const phoneNumber = contact?.phoneNumbers?.[0]?.number;
    if (!phoneNumber) {
      showAlert("error", "No phone number available");
      return;
    }

    const friend = await getUserByPhoneNumber(phoneNumber.slice(3));

    const deepLinkUrl = ExpoLinking.createURL("/", {
      queryParams: { friendId: friend?.user?.$id, userId: userId },
    });

    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      showAlert(
        "info",
        "Your device does not support SMS",
        "SMS Not Available"
      );
      return;
    }

    const message = `Hey, I'd like to add you as a friend on Memories! Tap here to accept: ${deepLinkUrl}`;
    const recipients = [phoneNumber];

    try {
      const { result } = await SMS.sendSMSAsync(recipients, message);

      if (friend.success && friend.user && result === SENT) {
        const response = await createFriendRequest(userId, friend?.user?.$id);

        if (response) {
          showAlert("success", "Friend request sent successfully");
          setContacts((prevContacts) =>
            prevContacts.map((c) =>
              c.id === contact.id ? { ...c, friendshipStatus: "pending" } : c
            )
          );

          if (onFriendStatusChange) {
            onFriendStatusChange();
          }
        } else {
          showAlert("error", "Failed to send friend request");
        }
      }
    } catch (error) {
      showAlert("error", "Failed to send SMS");
      console.error(error);
    }
  };

  const renderContactItem = ({ item }: { item: ContactWithStatus }) => {
    return (
      <View className="flex-row items-center py-4 border-b border-white/10">
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
          <View className="w-12 h-12 rounded-full mr-4 bg-black-300/60 items-center justify-center">
            <Text className="text-white text-lg font-rubik-medium">
              {item.name && item.name.charAt(0)}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="text-white font-rubik-medium">{item.name}</Text>
          <Text className="text-black-100 text-sm font-rubik">
            {item.phoneNumbers && item.phoneNumbers[0]?.number}
          </Text>
        </View>

        {/* Status Buttons */}
        {item.friendshipStatus === "pending" ? (
          <View className="bg-yellow-100/20 px-3 py-2 rounded-lg flex-row items-center">
            <Feather name="clock" size={16} color="#FDECAF" />
            <Text className="text-yellow-100 font-rubik-medium ml-2">
              Pending
            </Text>
          </View>
        ) : item.friendshipStatus === "accepted" ? (
          <View className="bg-orange-100/20 px-3 py-2 rounded-lg flex-row items-center">
            <Feather name="check" size={16} color="#EC997E" />
            <Text className="text-orange-100 font-rubik-medium ml-2">
              Friends
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => handleAddContact(item)}
            className="bg-primary-100/20 px-3 py-2 rounded-lg flex-row items-center"
            activeOpacity={0.7}
          >
            <Feather name="user-plus" size={16} color="#475867" />
            <Text className="text-primary-100 font-rubik-medium ml-2">Add</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPermissionDeniedUI = () => {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <Feather name="users" size={48} color="#666876" />
        <Text className="text-white font-rubik-bold text-lg mt-4 text-center">
          Contacts Access Required
        </Text>
        <Text className="text-black-100 font-rubik mt-2 text-center">
          This app needs access to your contacts to find your friends. Your
          privacy is important to us, and contacts are only used for finding
          friends on the app.
        </Text>
        <TouchableOpacity
          onPress={openSettings}
          className="mt-4 px-5 py-3"
          activeOpacity={0.7}
        >
          <Text className="text-black-100 font-rubik-medium">
            Open Settings
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-rubik-bold text-white">
          Phone Contacts
        </Text>
        <TouchableOpacity
          onPress={loadContacts}
          className="p-2 rounded-full bg-black-300/60"
          activeOpacity={0.7}
        >
          <Feather name="refresh-cw" size={18} color="#FDECAF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#FDECAF" size="large" />
          <Text className="text-black-100 font-rubik mt-4">
            Loading contacts...
          </Text>
        </View>
      ) : permissionStatus !== GRANTED ? (
        renderPermissionDeniedUI()
      ) : contacts.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Feather name="users" size={48} color="#666876" />
          <Text className="text-black-100 font-rubik mt-4 text-center px-6">
            No contacts found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          renderItem={renderContactItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
