import { updateFriendshipStatus } from "@/lib/appwrite";
import { Button, Modal, Text, View } from "react-native";

type AddFriendModalProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  friendId: string;
  userId: string;
};

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  modalVisible,
  setModalVisible,
  friendId,
  userId,
}) => {
  const handleAcceptFriendRequest = async () => {
    const response = await updateFriendshipStatus(userId, "accepted");

    setModalVisible(false);
  };

  return (
    <Modal visible={modalVisible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            width: 300,
            padding: 20,
            backgroundColor: "white",
            borderRadius: 10,
          }}
        >
          <Text>Add user with ID: {friendId} as friend?</Text>
          <Button
            title="Yes"
            onPress={() => {
              handleAcceptFriendRequest();
            }}
          />
          <Button title="No" onPress={() => setModalVisible(false)} />
        </View>
      </View>
    </Modal>
  );
};
