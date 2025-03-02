import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { Models } from "react-native-appwrite";
import { createImageMetadata, uploadImage } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";

interface FriendsListBottomSheetProps {
  isVisible: boolean;
  handleImageSend: () => void;
  friends: Models.Document[];
  uri: string;
}

const FriendsListBottomSheet: React.FC<FriendsListBottomSheetProps> = ({
  isVisible,
  handleImageSend,
  friends,
  uri,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { user } = useGlobalContext();
  const snapPoints = useMemo(() => ["50%", "75%"], []);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleSend = async () => {
    console.log("Sending to selected users:", selectedUsers);

    try {
      const fileName = `${Date.now()}.jpg`;

      const file = {
        name: fileName,
        type: "image/jpeg",
        uri: uri,
      };

      console.log("File prepared:", file);

      const uploadedFile = await uploadImage(file);

      if (!uploadedFile || !uploadedFile.$id) {
        throw new Error("File upload failed");
      }

      console.log("Upload successful:", uploadedFile);

      const response = await createImageMetadata(
        uploadedFile.$id,
        user?.$id!,
        selectedUsers
      );

      if (!response) {
        throw new Error("Failed to create image metadata");
      }

      handleImageSend();
      alert("Image sent successfully!");
    } catch (error) {
      console.error("Error sending image:", error);
      alert("Failed to send image");
    }
  };

  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const renderItem = ({ item }: { item: Models.Document }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => toggleUserSelection(item.$id)}
    >
      {item.profile_picture ? (
        <Image
          source={{ uri: item.profile_picture }}
          style={styles.profileImage}
        />
      ) : (
        <View style={[styles.profileImage, styles.initialsContainer]}>
          <Text style={styles.initialsText}>{getInitials(item.name)}</Text>
        </View>
      )}
      <Text style={styles.userName}>{item.name}</Text>
      <View
        style={[
          styles.selectionCircle,
          selectedUsers.includes(item.$id) && styles.selectedCircle,
        ]}
      >
        {selectedUsers.includes(item.$id) && (
          <Ionicons name="checkmark" size={20} color="white" />
        )}
      </View>
    </TouchableOpacity>
  );

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      handleImageSend();
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChanges}
      handleStyle={styles.sheetHandle}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.sheetBackground}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>Send to Friends</Text>
        <FlatList
          data={friends}
          renderItem={renderItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.listContent}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            selectedUsers.length === 0 && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={selectedUsers.length === 0}
        >
          <Text style={styles.sendButtonText}>
            Send to {selectedUsers.length > 0 ? selectedUsers.length : ""}{" "}
            {selectedUsers.length === 1 ? "friend" : "friends"}
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sheetBackground: {
    backgroundColor: "#f8f8f8",
  },
  sheetHandle: {
    backgroundColor: "#f8f8f8",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  indicator: {
    backgroundColor: "#ccc",
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    backgroundColor: "#e0e0e0",
  },
  userName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCircle: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  sendButtonDisabled: {
    backgroundColor: "#a0c8ff",
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  initialsContainer: {
    backgroundColor: "#E1E1E1",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FriendsListBottomSheet;
