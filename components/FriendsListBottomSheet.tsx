import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  StatusBar,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
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
      StatusBar.setBarStyle("light-content");
    } else {
      bottomSheetRef.current?.close();
      StatusBar.setBarStyle("default");
    }

    return () => {
      StatusBar.setBarStyle("default");
    };
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

      const metadataPromises = selectedUsers.map(async (recipientId) => {
        return createImageMetadata(uploadedFile.$id, user?.$id!, recipientId);
      });

      const responses = await Promise.allSettled(metadataPromises);

      if (responses.some((response) => !response)) {
        throw new Error("Failed to create image metadata for some users");
      }

      handleImageSend();
      alert(
        `Image sent successfully to ${selectedUsers.length} ${
          selectedUsers.length === 1 ? "friend" : "friends"
        }!`
      );
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
      className="flex-row items-center py-3.5 border-b border-white/10"
      onPress={() => toggleUserSelection(item.$id)}
      activeOpacity={0.7}
    >
      {item.profile_picture ? (
        <Image
          source={{ uri: item.profile_picture }}
          className="w-12 h-12 rounded-full mr-4 bg-gray-700"
        />
      ) : (
        <View className="w-12 h-12 rounded-full mr-4 bg-gray-700 justify-center items-center">
          <Text className="text-white text-lg font-rubik-medium">
            {getInitials(item.name)}
          </Text>
        </View>
      )}
      <Text className="flex-1 text-white text-base font-rubik-medium">
        {item.name}
      </Text>
      <View
        className={`w-[26px] h-[26px] rounded-full border-2 justify-center items-center
          ${
            selectedUsers.includes(item.$id)
              ? "bg-[#FDECAF] border-[#FDECAF]"
              : "border-gray-600"
          }`}
      >
        {selectedUsers.includes(item.$id) && (
          <Ionicons name="checkmark" size={18} color="#121212" />
        )}
      </View>
    </TouchableOpacity>
  );

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      handleImageSend();
    }
  };

  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.8}
      />
    ),
    []
  );

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
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text className="text-xl text-white text-center font-rubik-bold my-4 tracking-wider">
          Send to Friends
        </Text>
        <View className="mb-3 px-2">
          <Text className="text-sm text-gray-400 font-rubik-medium">
            {selectedUsers.length > 0
              ? `${selectedUsers.length} ${
                  selectedUsers.length === 1 ? "friend" : "friends"
                } selected`
              : "Select friends to share with"}
          </Text>
        </View>
        <FlatList
          data={friends}
          renderItem={renderItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={friends.length > 4}
        />
        <View className="pt-4 pb-8">
          <TouchableOpacity
            className={`bg-yellow-100 border-2 border-primary-100 rounded-full py-4 mt-5 w-full
              ${selectedUsers.length === 0 ? "opacity-30" : ""}`}
            onPress={handleSend}
            disabled={selectedUsers.length === 0}
          >
            <View className="flex flex-row items-center justify-center">
              <Ionicons name="paper-plane" size={20} color="text-black-300" />
              <Text className="text-lg font-rubik-bold text-black-300 ml-2">
                Send to Friends
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sheetBackground: {
    backgroundColor: "#121212",
  },
  sheetHandle: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  indicator: {
    backgroundColor: "#444",
    width: 40,
    height: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default FriendsListBottomSheet;
