import { logout } from "@/lib/appwrite";
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
import { useEffect, useState } from "react";

export default function Profile() {
  const { user, refetch } = useGlobalContext();
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.Image],
        });

        if (data.length > 0) {
          setContacts(data);
          console.log(data, "contacts");
        }
      }
    })();
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

  const renderContactItem = ({ item }: { item: Contacts.Contact }) => {
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
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  contactName: {
    fontSize: 16,
  },
});
