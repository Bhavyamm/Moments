import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import FriendsList from "./FriendsList";
import ContactsList from "./ContactsList";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AddFriendsBottomSheetProps {
  initialIndex: number;
  onClose: () => void;
  userId: string;
}

// Add a ref type for external control
export interface AddFriendsBottomSheetHandle {
  open: () => void;
  close: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const AddFriendsBottomSheet = React.forwardRef<
  AddFriendsBottomSheetHandle,
  AddFriendsBottomSheetProps
>(({ initialIndex, onClose, userId }, ref) => {
  const [activeTab, setActiveTab] = useState<"friends" | "contacts">("friends");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  // Calculate snap points considering safe area insets
  const snapPoints = useMemo(() => {
    const bottomInset = Platform.OS === "ios" ? insets.bottom : 0;
    return [
      `${Math.round(65 * (SCREEN_HEIGHT / 100))}`,
      `${Math.round(90 * (SCREEN_HEIGHT / 100))}`,
    ];
  }, [insets.bottom]);

  // Use a dedicated effect to control the bottom sheet with better logging
  useEffect(() => {
    console.log(
      "AddFriendsBottomSheet - initialIndex changed to:",
      initialIndex
    );
    console.log("BottomSheetRef exists:", !!bottomSheetRef.current);

    // Increased timeout to ensure component is fully rendered
    const timer = setTimeout(() => {
      console.log(
        "Executing delayed bottom sheet control. Current initialIndex:",
        initialIndex
      );
      if (initialIndex >= 0) {
        console.log("Attempting to open bottom sheet to index:", initialIndex);
        if (bottomSheetRef.current) {
          bottomSheetRef.current.snapToIndex(initialIndex);
          console.log("snapToIndex called successfully");
        } else {
          console.warn("bottomSheetRef.current is null when trying to open");
        }
      } else {
        console.log("Attempting to close bottom sheet");
        bottomSheetRef.current?.close();
      }
    }, 300); // Increased timeout for better reliability

    return () => {
      console.log("Cleaning up bottom sheet effect");
      clearTimeout(timer);
    };
  }, [initialIndex]);

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

  // Add a direct method to open the sheet that can be called from outside components if needed
  React.useImperativeHandle(
    ref,
    () => ({
      open: () => {
        console.log("Direct open method called");
        bottomSheetRef.current?.snapToIndex(0);
      },
      close: () => {
        console.log("Direct close method called");
        bottomSheetRef.current?.close();
      },
    }),
    [bottomSheetRef]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChanges}
      handleStyle={styles.handleStyle}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.sheetBackground}
      backdropComponent={renderBackdrop}
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
      animateOnMount={true}
      style={styles.bottomSheet}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Connections</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "friends" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("friends")}
          >
            <Feather
              name="users"
              size={18}
              color={activeTab === "friends" ? "#00E5FF" : "#666"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "friends" && styles.activeTabText,
              ]}
            >
              Friends
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "contacts" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("contacts")}
          >
            <Feather
              name="phone"
              size={18}
              color={activeTab === "contacts" ? "#00E5FF" : "#666"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "contacts" && styles.activeTabText,
              ]}
            >
              Contacts
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentArea}>
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
});

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: "rgba(30,30,30,0.6)",
  },
  activeTabButton: {
    backgroundColor: "rgba(0,229,255,0.15)",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 8,
  },
  activeTabText: {
    color: "#00E5FF",
  },
  contentArea: {
    flex: 1,
    padding: 20,
  },
});

export default AddFriendsBottomSheet;
