import { useGlobalContext } from "@/lib/global-provider";
import { useRouter } from "expo-router";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export const Header = ({
  handleOpenFriendsAndContactsBottomSheet,
}: {
  handleOpenFriendsAndContactsBottomSheet: () => void;
}) => {
  const { friends, friendsLoading } = useGlobalContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleAvatarPress = () => {
    router.push("/profile");
  };

  const handleFriendsPress = () => {
    handleOpenFriendsAndContactsBottomSheet();
  };

  const handleConversationPress = () => {};

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: "black",
        zIndex: 10,
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={handleAvatarPress}
          className="bg-gray-700 p-2.5 rounded-full"
        >
          <Ionicons name="person-outline" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFriendsPress}
          className="bg-gray-700 p-2.5 rounded-full flex-row items-center"
        >
          <Ionicons name="people-outline" size={22} color="white" />
          {friendsLoading ? (
            <ActivityIndicator
              size="small"
              color="white"
              style={{ marginLeft: 8 }}
            />
          ) : (
            <Text className="text-white ml-2 font-rubik-medium">
              {`${friends?.length || 0} Friends`}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleConversationPress}
          className="bg-gray-700 p-2.5 rounded-full"
        >
          <Ionicons name="chatbubble-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
