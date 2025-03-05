import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { getCurrentUser, getFriendsByUserId } from "./appwrite";
import { useAppwrite } from "./useAppwrite";
import { Models } from "react-native-appwrite";

interface GlobalContextType {
  isLogged: boolean;
  user: User | null;
  friends: Models.Document[];
  loading: boolean;
  friendsLoading: boolean;
  refetch: (newParams: Record<string, string | number>) => Promise<void>;
}

interface User {
  $id: string;
  name: string;
  email: string;
  avatar: string;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const { data: user, loading, refetch } = useAppwrite({ fn: getCurrentUser });
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friends, setFriends] = useState<Models.Document[]>([]);

  const isLogged = !!user;

  useEffect(() => {
    const getFriends = async () => {
      if (!user?.$id) return;

      try {
        setFriendsLoading(true);
        const users = await getFriendsByUserId(user.$id);
        setFriends(users);
      } catch (error) {
        console.error("Error fetching friends:", error);
        setFriends([]);
      } finally {
        setFriendsLoading(false);
      }
    };

    getFriends();
  }, [user?.$id]);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        user,
        friends,
        loading,
        friendsLoading,
        refetch,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context)
    throw new Error("useGlobalContext must be used within a GlobalProvider");

  return context;
};

export default GlobalProvider;
