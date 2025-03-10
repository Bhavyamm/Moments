import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Image } from "expo-image";
import ShutterControls from "@/components/ShutterControls";
import * as Linking from "expo-linking";
import { FriendRequestModal } from "@/components/FriendRequestModal";
import {
  checkFriendshipStatus,
  getImageFromStorage,
  getUnViewedImages,
} from "@/lib/appwrite";
import { ShutterControlsAfterCapture } from "@/components/ShutterControlsAfterCapture";
import FriendsListBottomSheet from "@/components/FriendsListBottomSheet";
import { useGlobalContext } from "@/lib/global-provider";
import { Models } from "react-native-appwrite";
import { UnViewedImages } from "@/components/UnViewedImages";
import { Header } from "@/components/Header";
import AddFriendsBottomSheet from "@/components/AddFriendsBottomSheet";
import { MaterialIcons } from "@expo/vector-icons";

export default function Home() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");
  const [recording, setRecording] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [unviewedImages, setUnviewedImages] = useState<Models.Document[]>([]);
  const [showFriendsAndContactsList, setShowFriendsAndContactsList] =
    useState(false);

  const { user, friends } = useGlobalContext();

  const [friendId, setFriendId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const handleDeepLink = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const { queryParams } = Linking.parse(initialUrl);
        if (queryParams?.friendId && queryParams?.userId) {
          const newFriendId = queryParams.friendId as string;
          const newUserId = queryParams.userId as string;

          const { areFriends } = await checkFriendshipStatus(
            newUserId,
            newFriendId
          );

          setFriendId(newFriendId);
          setUserId(newUserId);
          if (!areFriends) {
            setModalVisible(true);
          }
        }
      }
    };

    handleDeepLink();
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", async ({ url }) => {
      const { queryParams } = Linking.parse(url);
      if (queryParams?.friendId && queryParams?.userId) {
        const newFriendId = queryParams.friendId as string;
        const newUserId = queryParams.userId as string;

        const { areFriends } = await checkFriendshipStatus(
          newUserId,
          newFriendId
        );

        setFriendId(newFriendId);
        setUserId(newUserId);
        if (!areFriends) {
          setModalVisible(true);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const fetchUnviewedImages = async () => {
      try {
        const unViewedImages = await getUnViewedImages(user?.$id!);

        const imagesWithStorageData = await Promise.all(
          unViewedImages.map(async (image) => {
            const storageData = await getImageFromStorage(image.image_id);
            return {
              ...image,
              storageData,
            };
          })
        );

        setUnviewedImages(imagesWithStorageData);
      } catch (error) {
        console.error("Error fetching unviewed images:", error);
      }
    };

    fetchUnviewedImages();
  }, []);

  const handleImagesViewed = (viewedImageIds: string[]) => {
    setUnviewedImages((prev) =>
      prev.filter((image) => !viewedImageIds.includes(image.$id))
    );
  };

  const handleRequestPermission = async () => {
    const permissionResult = await requestPermission();

    if (!permissionResult.granted) {
      Alert.alert(
        "Camera Permission",
        "We need camera access to continue. Would you like to open settings and grant permission manually?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
  };
  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="camera-alt" size={64} color="#fff" />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            This app needs camera access to capture and share moments with your
            friends. Your privacy is important to us, and photos are only shared
            with people you choose.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleRequestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      setUri(photo.uri);
    }
  };

  const recordVideo = async () => {
    if (recording) {
      setRecording(false);
      ref.current?.stopRecording();
      return;
    }
    setRecording(true);
    const video = await ref.current?.recordAsync();
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "picture" ? "video" : "picture"));
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleOpenFriendsBottomSheet = () => {
    setShowFriendsList(true);
  };

  const handleOpenFriendsAndContactsBottomSheet = () => {
    setShowFriendsAndContactsList(true);
  };

  const handleDiscard = () => {
    setUri(null);
  };

  const handleImageSend = () => {
    setShowFriendsList(false);
    setUri(null);
  };

  return (
    <View style={styles.root}>
      <Header
        handleOpenFriendsAndContactsBottomSheet={
          handleOpenFriendsAndContactsBottomSheet
        }
      />
      <View style={styles.container}>
        {unviewedImages.length > 0 ? (
          <UnViewedImages
            unviewedImages={unviewedImages}
            onImagesViewed={handleImagesViewed}
          />
        ) : (
          <>
            <View style={styles.cameraContainer}>
              <CameraView
                style={styles.camera}
                ref={ref}
                mode={mode}
                facing={facing}
                mute={false}
                animateShutter={false}
                mirror={true}
                responsiveOrientationWhenOrientationLocked
              />
              {uri && (
                <View style={styles.capturedImageOverlay}>
                  <Image source={{ uri: uri }} style={styles.capturedImage} />
                </View>
              )}
            </View>

            {uri ? (
              <ShutterControlsAfterCapture
                onSend={handleOpenFriendsBottomSheet}
                onDiscard={handleDiscard}
              />
            ) : (
              <ShutterControls
                mode={mode}
                onToggleMode={toggleMode}
                onCapture={mode === "picture" ? takePicture : recordVideo}
                onToggleFacing={toggleFacing}
              />
            )}

            <FriendRequestModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              friendId={friendId}
              userId={userId}
            />

            <FriendsListBottomSheet
              isVisible={showFriendsList}
              handleImageSend={handleImageSend}
              friends={friends}
              uri={uri!}
            />

            <AddFriendsBottomSheet
              isVisible={showFriendsAndContactsList}
              onClose={() => setShowFriendsAndContactsList(false)}
              userId={user?.$id!}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 24,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 24,
  },
  permissionCard: {
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: "#3D7DFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  capturedImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  capturedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
});
