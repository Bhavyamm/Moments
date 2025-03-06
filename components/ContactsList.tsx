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
  AppState,
} from "react-native";
import * as Contacts from "expo-contacts";
import * as SMS from "expo-sms";
import * as ExpoLinking from "expo-linking";
import { useEffect, useState, useRef, useCallback } from "react";
import { Feather } from "@expo/vector-icons";
import { GRANTED, SENT } from "@/constants/constants";
import { useAlert } from "@/lib/alert-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ContactWithStatus extends Contacts.Contact {
  friendshipStatus?: "none" | "pending" | "accepted";
}

// Simplified contact structure for storage
interface StorableContact {
  id: string;
  name: string;
  phoneNumber?: string;
  imageUri?: string;
  friendshipStatus: "none" | "pending" | "accepted";
}

interface ContactsProps {
  userId: string;
  onFriendStatusChange?: () => void;
}

// Base storage key prefix
const MANUAL_CONTACTS_STORAGE_PREFIX = "MANUAL_CONTACTS_";

export default function ContactsList({
  userId,
  onFriendStatusChange,
}: ContactsProps) {
  const [contacts, setContacts] = useState<ContactWithStatus[]>([]);
  const [manuallySelectedContacts, setManuallySelectedContacts] = useState<
    StorableContact[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const isMounted = useRef(true);

  const { showAlert } = useAlert();

  // Define the storage key within the component where userId is in scope
  const storageKey = `${MANUAL_CONTACTS_STORAGE_PREFIX}${userId}`;

  // Convert complex contact to storable format
  const contactToStorable = (contact: ContactWithStatus): StorableContact => {
    // Handle different name formats
    let name = "Unknown";
    if (contact.name) {
      name = contact.name;
    } else if (contact.firstName || contact.lastName) {
      name = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
    }

    return {
      id: contact.id || String(Math.random()),
      name: name,
      phoneNumber: contact.phoneNumbers?.[0]?.number,
      imageUri: contact.image?.uri,
      friendshipStatus: contact.friendshipStatus || "none",
    };
  };

  // Save manually selected contacts
  const saveManualContacts = useCallback(
    async (contacts: StorableContact[]) => {
      try {
        console.log(`Saving ${contacts.length} manual contacts to storage`);
        await AsyncStorage.setItem(storageKey, JSON.stringify(contacts));
      } catch (error) {
        console.error("Error saving manual contacts to storage:", error);
      }
    },
    [storageKey]
  );

  // Load manually selected contacts
  const loadManualContacts = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem(storageKey);
      if (storedData) {
        const parsedContacts = JSON.parse(storedData) as StorableContact[];
        console.log(
          `Loaded ${parsedContacts.length} manual contacts from storage`
        );
        setManuallySelectedContacts(parsedContacts);
        return parsedContacts;
      }
    } catch (error) {
      console.error("Error loading manual contacts from storage:", error);
    }
    return [];
  }, [storageKey]);

  // Load all data on mount
  useEffect(() => {
    if (userId) {
      const initialize = async () => {
        const manualContacts = await loadManualContacts();
        const { status } = await Contacts.getPermissionsAsync();
        setPermissionStatus(status);

        if (status === GRANTED) {
          fetchContacts(manualContacts);
        } else {
          setLoading(false);
        }
      };

      initialize();
    }

    return () => {
      isMounted.current = false;
    };
  }, [userId, loadManualContacts]);

  // Update storage when manually selected contacts change
  useEffect(() => {
    if (manuallySelectedContacts.length > 0) {
      saveManualContacts(manuallySelectedContacts);
    }
  }, [manuallySelectedContacts, saveManualContacts]);

  // Monitor app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        console.log("App returned to foreground - checking permissions");
        recheckPermissions();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  const recheckPermissions = async () => {
    setTimeout(async () => {
      if (!isMounted.current) return;

      try {
        const { status } = await Contacts.getPermissionsAsync();
        console.log("Current permission status:", status);
        setPermissionStatus(status);

        if (status === GRANTED) {
          setLoading(true);
          // Re-load manual contacts to ensure we have the latest data
          const manualContacts = await loadManualContacts();
          fetchContacts(manualContacts);
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
      }
    }, 500);
  };

  const requestContactsPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      console.log("Permission request result:", status);
      setPermissionStatus(status);

      if (status === GRANTED) {
        fetchContacts(manuallySelectedContacts);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error requesting contacts permission:", error);
      setLoading(false);
      showAlert("error", "Failed to request contacts permission");
    }
  };

  // Request additional contacts using the contact picker
  const requestMoreContacts = async () => {
    try {
      setLoading(true);
      const pickedContact = await Contacts.presentContactPickerAsync();

      if (pickedContact) {
        console.log("Selected contact ID:", pickedContact.id);

        // Fetch complete contact information using the ID
        const completeContact = await Contacts.getContactByIdAsync(
          pickedContact?.id!
        );

        if (!completeContact) {
          showAlert("error", "Failed to retrieve complete contact details");
          setLoading(false);
          return;
        }

        console.log("Complete contact name:", completeContact.name);
        const phoneNumber = completeContact?.phoneNumbers?.[0]?.number;

        if (phoneNumber) {
          try {
            const friend = await getUserByPhoneNumber(phoneNumber.slice(3));
            let friendshipStatus = "none";

            if (friend.success && friend.user) {
              const status = await checkFriendshipStatus(
                userId,
                friend.user.$id
              );
              friendshipStatus = status?.status || "none";
            }

            const contactWithStatus = {
              ...completeContact,
              friendshipStatus,
            } as ContactWithStatus;

            // Create storable version with the complete name
            const storableContact = contactToStorable(contactWithStatus);

            // Check if contact already exists
            const existingManual = manuallySelectedContacts.some(
              (c) => c.id === storableContact.id
            );
            const existingInContacts = contacts.some(
              (c) => c.id === storableContact.id
            );

            if (existingManual || existingInContacts) {
              showAlert("info", "Contact already in your list");
            } else {
              // Add to display list
              setContacts((prev) => [...prev, contactWithStatus]);

              // Add to persistent storage list
              setManuallySelectedContacts((prev) => [...prev, storableContact]);

              // Save immediately to ensure persistence
              const updatedManualContacts = [
                ...manuallySelectedContacts,
                storableContact,
              ];
              saveManualContacts(updatedManualContacts);

              showAlert("success", "Added new contact");
            }
          } catch (error) {
            console.error("Error processing contact:", error);
            showAlert("error", "Failed to process selected contact");
          }
        } else {
          showAlert("info", "Selected contact has no phone number");
        }
      } else {
        console.log("No contact selected");
      }
    } catch (error) {
      console.error("Error with contact picker:", error);
      showAlert("error", "Failed to select additional contact");
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts and merge with manually selected contacts
  const fetchContacts = async (manualContacts = manuallySelectedContacts) => {
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.Image,
          Contacts.Fields.PhoneNumbers,
        ],
      });

      console.log(`Found ${data.length} system contacts`);
      console.log(`Have ${manualContacts.length} manually selected contacts`);

      // Process system contacts
      const systemContactsWithStatus = await Promise.all(
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

      // Convert manual contacts back to full contacts
      const manualContactsAsFullContacts = manualContacts.map(
        (storedContact) => {
          // Create a minimal Contact object from the stored data
          return {
            id: storedContact.id,
            name: storedContact.name,
            phoneNumbers: storedContact.phoneNumber
              ? [{ number: storedContact.phoneNumber }]
              : [],
            image: storedContact.imageUri
              ? { uri: storedContact.imageUri }
              : undefined,
            imageAvailable: !!storedContact.imageUri,
            friendshipStatus: storedContact.friendshipStatus,
          } as ContactWithStatus;
        }
      );

      // Build a set of system contact IDs for deduplication
      const systemContactIds = new Set(
        systemContactsWithStatus.map((c) => c.id)
      );

      // Filter out manual contacts that already exist in system contacts
      const uniqueManualContacts = manualContactsAsFullContacts.filter(
        (c) => !systemContactIds.has(c.id)
      );

      // Merge the contacts
      const mergedContacts = [
        ...systemContactsWithStatus,
        ...uniqueManualContacts,
      ];

      if (isMounted.current) {
        setContacts(mergedContacts);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      if (isMounted.current) {
        showAlert("error", "Failed to load contacts");
        setLoading(false);
      }
    }
  };

  const loadContacts = async () => {
    setLoading(true);
    const { status } = await Contacts.getPermissionsAsync();
    setPermissionStatus(status);

    if (status === GRANTED) {
      // Re-load manual contacts to ensure we have the latest data
      const manualContacts = await loadManualContacts();
      fetchContacts(manualContacts);
    } else {
      requestContactsPermission();
    }
  };

  const openSettings = () => {
    Linking.openSettings().catch(() => {
      showAlert("error", "Unable to open settings");
    });
  };

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

          // Update the contact in both lists
          setContacts((prevContacts) =>
            prevContacts.map((c) =>
              c.id === contact.id ? { ...c, friendshipStatus: "pending" } : c
            )
          );

          // Also update in the manual contacts list if it exists there
          setManuallySelectedContacts((prevContacts) => {
            const updated = prevContacts.map((c) =>
              c.id === contact.id
                ? { ...c, friendshipStatus: "pending" as "pending" }
                : c
            );
            // Save the updated list immediately
            saveManualContacts(updated);
            return updated;
          });

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
          className="bg-primary-100/20 px-5 py-3 rounded-lg mt-6"
          activeOpacity={0.7}
        >
          <Text className="text-primary-100 font-rubik-medium">
            Open Settings
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render UI when contacts are loaded
  const renderContactsList = () => {
    return (
      <>
        {contacts.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Feather name="users" size={48} color="#666876" />
            <Text className="text-black-100 font-rubik mt-4 text-center px-6">
              No contacts found.
            </Text>
            <TouchableOpacity
              onPress={requestMoreContacts}
              className="bg-primary-100/20 px-5 py-3 rounded-lg mt-6"
              activeOpacity={0.7}
            >
              <Text className="text-primary-100 font-rubik-medium">
                Select a Contact
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={contacts}
              keyExtractor={(item) =>
                item.id?.toString() || Math.random().toString()
              }
              renderItem={renderContactItem}
              contentContainerStyle={{ paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
            />

            {/* Add Contact Button */}
            <View className="absolute bottom-6 left-0 right-0 items-center">
              <TouchableOpacity
                onPress={requestMoreContacts}
                className="bg-black-300/80 px-5 py-3 rounded-full flex-row items-center"
                activeOpacity={0.7}
              >
                <Feather name="user-plus" size={18} color="#FDECAF" />
                <Text className="text-white font-rubik-medium ml-2">
                  Add Contact
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </>
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
      ) : (
        renderContactsList()
      )}

      <View className="absolute bottom-6 left-0 right-0 items-center">
        <TouchableOpacity
          onPress={openSettings}
          className="bg-black-300/80 px-5 py-3 rounded-full flex-row items-center"
          activeOpacity={0.7}
        >
          <Feather name="user-plus" size={18} color="#FDECAF" />
          <Text className="text-white font-rubik-medium ml-2">Add Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
