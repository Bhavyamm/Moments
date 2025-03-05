import { getUserById, updateFriendshipStatus } from "@/lib/appwrite";
import {
  Modal,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";

type FriendRequestModalProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  friendId: string;
  userId: string;
};

export const FriendRequestModal: React.FC<FriendRequestModalProps> = ({
  modalVisible,
  setModalVisible,
  friendId,
  userId,
}) => {
  const [friendName, setFriendName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const handleAcceptFriendRequest = async () => {
    const response = await updateFriendshipStatus(userId, "accepted");
    setModalVisible(false);
  };

  useEffect(() => {
    const getFriendDetails = async () => {
      try {
        setLoading(true);
        const response = await getUserById(friendId);
        setFriendName(response?.name || "");
      } catch (error) {
        console.error("Error getting friend details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (friendId) {
      getFriendDetails();
    }
  }, [friendId]);

  return (
    <Modal visible={modalVisible} animationType="fade" transparent>
      <View className="flex-1 justify-center items-center bg-black/80">
        <View className="w-[320px] bg-black-300 p-6 rounded-2xl border border-white/10">
          {loading ? (
            <View className="py-8">
              <ActivityIndicator color="#FDECAF" />
            </View>
          ) : (
            <>
              <View className="items-center mb-6">
                <View className="bg-yellow-100/20 p-4 rounded-full mb-4">
                  <Feather name="user-plus" size={28} color="#FDECAF" />
                </View>
                <Text className="text-xl text-white font-rubik-bold mb-2 text-center">
                  Friend Request
                </Text>
                <Text className="text-black-100 font-rubik text-center">
                  <Text className="font-rubik-bold">{friendName}</Text> would
                  like to add you as a friend
                </Text>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10"
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-rubik-medium text-center">
                    Decline
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAcceptFriendRequest}
                  className="flex-1 py-3 rounded-xl bg-yellow-100"
                  activeOpacity={0.7}
                >
                  <Text className="text-black-300 font-rubik-bold text-center">
                    Accept
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
