import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { Models } from "react-native-appwrite";
import { storage, config } from "@/lib/appwrite";
import { useState, useEffect } from "react";

export const UnViewedImages = ({
  unviewedImages,
}: {
  unviewedImages: Models.Document[];
}) => {
  // Properly type the state objects with index signatures
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [errorStates, setErrorStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadImageUrls = async () => {
      const urls: Record<string, string> = {};

      for (const image of unviewedImages) {
        try {
          setLoadingStates((prev) => ({ ...prev, [image.$id]: true }));

          // Get the file preview URL properly
          const previewUrl = await storage.getFilePreview(
            config.imagesBucketId!,
            image.image_id
          );

          urls[image.$id] = previewUrl.toString();
          setErrorStates((prev) => ({ ...prev, [image.$id]: false }));
        } catch (error) {
          console.error(`Error loading image ${image.image_id}:`, error);
          setErrorStates((prev) => ({ ...prev, [image.$id]: true }));
        } finally {
          setLoadingStates((prev) => ({ ...prev, [image.$id]: false }));
        }
      }

      setImageUrls(urls);
    };

    loadImageUrls();
  }, [unviewedImages]);

  return (
    <View style={styles.container}>
      {unviewedImages.map((image) => (
        <View key={image.$id} style={styles.imageContainer}>
          {loadingStates[image.$id] && (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={styles.loader}
            />
          )}

          {imageUrls[image.$id] && !errorStates[image.$id] && (
            <Image
              source={{ uri: imageUrls[image.$id] }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          {errorStates[image.$id] && (
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
