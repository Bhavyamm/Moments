import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Button, Text, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import ShutterControls from "@/components/ShutterControls";
import * as Linking from "expo-linking";
import { AddFriendModal } from "@/components/AddFriendModal";
import {
  checkFriendshipStatus,
  getFriendsByUserId,
  getImageFromStorage,
  getUnViewedImages,
} from "@/lib/appwrite";
import { ShutterControlsAfterCapture } from "@/components/ShutterControlsAfterCapture";
import FriendsListBottomSheet from "@/components/FriendsListBottomSheet";
import { useGlobalContext } from "@/lib/global-provider";
import { Models } from "react-native-appwrite";
import { UnViewedImages } from "@/components/UnViewedImages";
import { Header } from "@/components/Header";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Home() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");
  const [recording, setRecording] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [friends, setFriends] = useState<Models.Document[]>([]);
  const [unviewedImages, setUnviewedImages] = useState<Models.Document[]>([]);

  const { user } = useGlobalContext();

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
    const getFriends = async () => {
      try {
        const users = await getFriendsByUserId(user?.$id!);
        setFriends(users);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    getFriends();
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

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
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

  const handleDiscard = () => {
    setUri(null);
  };

  const handleImageSend = () => {
    setShowFriendsList(false);
    setUri(null);
  };

  return (
    <View style={styles.root}>
      <Header />
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

            <AddFriendModal
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
