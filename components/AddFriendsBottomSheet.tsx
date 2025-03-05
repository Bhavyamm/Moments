import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import FriendsList from "./FriendsList";
import ContactsList from "./ContactsList";

interface AddFriendsBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
}

type ActiveTab = "friends" | "contacts";

const AddFriendsBottomSheet: React.FC<AddFriendsBottomSheetProps> = ({
  isVisible,
  onClose,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("friends");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "75%"], []);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      onClose();
    }
  };

  const handleFriendStatusChange = () => {
    // This could be used to refresh the friends list when a friend request is sent
    console.log("Friend status changed");
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
      handleStyle={styles.handleStyle}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.sheetBackground}
      backdropComponent={renderBackdrop}
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
      style={styles.bottomSheet}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
          <Text className="text-xl text-white font-rubik-bold tracking-wide">
            Connections
          </Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View className="flex-row px-5 py-3 border-b border-white/10">
          <TouchableOpacity
            onPress={() => setActiveTab("friends")}
            className={`flex-row items-center py-2 px-4 rounded-full mr-3 ${
              activeTab === "friends" ? "bg-yellow-100" : "bg-black-300/60"
            }`}
          >
            <Feather
              name="users"
              size={18}
              color={activeTab === "friends" ? "#191D31" : "#8C8E98"}
            />
            <Text
              className={`ml-2 font-rubik-medium ${
                activeTab === "friends" ? "text-black-300" : "text-black-100"
              }`}
            >
              Friends
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("contacts")}
            className={`flex-row items-center py-2 px-4 rounded-full ${
              activeTab === "contacts" ? "bg-yellow-100" : "bg-black-300/60"
            }`}
          >
            <Feather
              name="phone"
              size={18}
              color={activeTab === "contacts" ? "#191D31" : "#8C8E98"}
            />
            <Text
              className={`ml-2 font-rubik-medium ${
                activeTab === "contacts" ? "text-black-300" : "text-black-100"
              }`}
            >
              Contacts
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 p-5">
          {activeTab === "friends" ? (
            <FriendsList userId={userId} />
          ) : (
            <ContactsList
              userId={userId}
              onFriendStatusChange={handleFriendStatusChange}
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  handleStyle: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  indicator: {
    backgroundColor: "#444",
    width: 40,
    height: 5,
  },
  sheetBackground: {
    backgroundColor: "#121212",
  },
});

export default AddFriendsBottomSheet;
