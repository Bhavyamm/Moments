import {
  createFriendRequest,
  getUserByPhoneNumber,
  logout,
  checkFriendshipStatus,
} from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import {
  Alert,
  Image,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Contacts from "expo-contacts";
import * as SMS from "expo-sms";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";

interface ContactWithStatus extends Contacts.Contact {
  friendshipStatus?: "none" | "pending" | "accepted";
}

export default function Profile() {
  const { user, refetch } = useGlobalContext();
  const [contacts, setContacts] = useState<ContactWithStatus[]>([]);

  const loadContacts = async () => {
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
                const friend = await getUserByPhoneNumber(phoneNumber.slice(3));
                if (friend.success && friend.user) {
                  const friendshipStatus = await checkFriendshipStatus(
                    user?.$id!,
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
        console.log(contactsWithStatus, "contacts with status");
      }
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      Alert.alert("Success", "Logged out successfully");
      refetch({});
    } else {
      Alert.alert("Error", "Failed to logout");
    }
  };

  const handleAddContact = async (contact: ContactWithStatus) => {
    const phoneNumber = contact?.phoneNumbers?.[0]?.number;
    if (!phoneNumber) {
      Alert.alert("Error", "No phone number available");
      console.log("Adding contact: No phone number available");
      return;
    }

    console.log("Adding contact:", phoneNumber);

    const friend = await getUserByPhoneNumber(phoneNumber.slice(3));

    const deepLinkUrl = Linking.createURL("/", {
      queryParams: { friendId: friend?.user?.$id, userId: user?.$id },
    });

    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("SMS Not Available", "Your device does not support SMS");
      return;
    }

    const message = `Hey, I'd like to add you as a friend on MyApp! Tap here to accept: ${deepLinkUrl}`;

    const recipients = [phoneNumber];

    try {
      const { result } = await SMS.sendSMSAsync(recipients, message);
      console.log("SMS result:", result);

      if (friend.success && friend.user && result === "sent") {
        const response = await createFriendRequest(
          user?.$id!,
          friend?.user?.$id
        );

        if (response) {
          Alert.alert("Success", "Friend request sent successfully");
          setContacts((prevContacts) =>
            prevContacts.map((c) =>
              c.id === contact.id ? { ...c, friendshipStatus: "pending" } : c
            )
          );
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
    const imageUri =
      item.imageAvailable && item.image && item.image.uri
        ? item.image.uri.startsWith("/")
          ? `file://${item.image.uri}`
          : item.image.uri
        : null;

    return (
      <View style={styles.contactItem}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.contactAvatar} />
        ) : (
          <View
            style={[
              styles.contactAvatar,
              {
                backgroundColor: "#ccc",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>
              {item.name.charAt(0)}
            </Text>
          </View>
        )}
        <Text style={styles.contactName}>{item.name}</Text>

        {item.friendshipStatus === "pending" ? (
          <View style={styles.pendingBtn}>
            <Feather name="clock" size={16} color="#fff" />
            <Text style={styles.pendingBtnText}>Pending</Text>
          </View>
        ) : item.friendshipStatus === "accepted" ? (
          <View style={styles.acceptedBtn}>
            <Feather name="check" size={16} color="#fff" />
            <Text style={styles.acceptedBtnText}>Friends</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => handleAddContact(item)}
          >
            <Text style={styles.addBtnText}>+Add</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.text}>{user?.name}</Text>
      <Text style={styles.text}>{user?.email}</Text>
      <Image source={{ uri: user?.avatar }} style={styles.avatar} />

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <View style={styles.logoutContent}>
          <Text style={styles.logoutText}>Logout</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.contactsHeader}>Contacts</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContactItem}
        contentContainerStyle={styles.contactsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    marginVertical: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  logoutBtn: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 30,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 16,
    color: "#000",
  },
  contactsHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  contactsList: {
    paddingHorizontal: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
    justifyContent: "space-between",
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  contactName: {
    fontSize: 16,
    flex: 1,
  },
  addBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 14,
  },
  pendingBtn: {
    backgroundColor: "#f0ad4e",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  pendingBtnText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 5,
  },
  acceptedBtn: {
    backgroundColor: "#5cb85c",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  acceptedBtnText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 5,
  },
});
