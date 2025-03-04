import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { Models } from "react-native-appwrite";
import { storage, config, updateImageViewedStatus } from "@/lib/appwrite";
import { useState, useEffect } from "react";
import { useGlobalContext } from "@/lib/global-provider";

export const UnViewedImages = ({
  unviewedImages,
  onImagesViewed,
}: {
  unviewedImages: Models.Document[];
  onImagesViewed?: (viewedImageIds: string[]) => void;
}) => {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [errorStates, setErrorStates] = useState<Record<string, boolean>>({});
  const [viewedStates, setViewedStates] = useState<Record<string, boolean>>({});
  const [viewTimers, setViewTimers] = useState<Record<string, NodeJS.Timeout>>(
    {}
  );

  const { user } = useGlobalContext();

  useEffect(() => {
    const loadImageUrls = async () => {
      const urls: Record<string, string> = {};

      for (const image of unviewedImages) {
        try {
          setLoadingStates((prev) => ({ ...prev, [image.image_id]: true }));

          const previewUrl = await storage.getFilePreview(
            config.imagesBucketId!,
            image.image_id
          );

          urls[image.image_id] = previewUrl.toString();
          setErrorStates((prev) => ({ ...prev, [image.image_id]: false }));
        } catch (error) {
          console.error(`Error loading image ${image.image_id}:`, error);
          setErrorStates((prev) => ({ ...prev, [image.image_id]: true }));
        } finally {
          setLoadingStates((prev) => ({ ...prev, [image.image_id]: false }));
        }
      }

      setImageUrls(urls);
    };

    loadImageUrls();

    return () => {
      Object.values(viewTimers).forEach((timer) => clearTimeout(timer));
    };
  }, [unviewedImages]);

  const markImageAsViewed = async (imageId: string) => {
    try {
      if (viewedStates[imageId]) {
        return;
      }

      const image = unviewedImages.find((img) => img.image_id === imageId);
      if (!image) return;

      setViewedStates((prev) => ({ ...prev, [imageId]: true }));

      const response = await updateImageViewedStatus(imageId, user?.$id!);

      if (onImagesViewed) {
        onImagesViewed([imageId]);
      }
    } catch (error) {
      console.error(`Error marking image ${imageId} as viewed:`, error);
    }
  };

  const handleImageLoad = (imageId: string) => {
    const timer = setTimeout(() => {
      markImageAsViewed(imageId);
    }, 2000);

    setViewTimers((prev) => ({ ...prev, [imageId]: timer }));
  };

  return (
    <View style={styles.container}>
      {unviewedImages.map((image) => (
        <View key={image.image_id} style={styles.imageContainer}>
          {loadingStates[image.image_id] && (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={styles.loader}
            />
          )}

          {imageUrls[image.image_id] && !errorStates[image.image_id] && (
            <Image
              source={{ uri: imageUrls[image.image_id] }}
              style={styles.image}
              resizeMode="cover"
              onLoad={() => handleImageLoad(image.image_id)}
            />
          )}

          {errorStates[image.image_id] && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load image</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  imageContainer: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loader: {
    position: "absolute",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});
