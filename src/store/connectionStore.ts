import { ConnectionRequests, feedUser } from "@/queries/types";
import { create } from "zustand";

type Connections = feedUser & {
  connectionId: string;
  status?: string;
};

interface ConnectionStore {
  connectionRequests: ConnectionRequests;
  userConnections: Connections[];
  onlineUsers: Set<string>;
  setConnectionRequests: (updatedRequests: ConnectionRequests) => void;
  setOnlineUsers: (users: string[]) => void;
  setUserConnections: (updatedConnections: Connections[]) => void;
  addOnlineUser: (user: string[]) => void;
  removeOnlineUser: (user: string) => void;
}

const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connectionRequests: [],
  userConnections: [],
  onlineUsers: new Set<string>(),
  setConnectionRequests: (updatedRequests: ConnectionRequests) => {
    set({
      connectionRequests: updatedRequests,
    });
  },
  setUserConnections: (updatedConnections) => {
    set({
      userConnections: updatedConnections,
    });
  },
  setOnlineUsers: (users) => {
    set(() => ({
      onlineUsers: new Set(users),
    }));
  },
  addOnlineUser: (user) => {
    const newOnlineUsers = get().onlineUsers;
    user.map((userid) => {
      newOnlineUsers.add(userid);
    });
    set(() => ({
      onlineUsers: newOnlineUsers,
    }));
  },
  removeOnlineUser: (user) => {
    set((prev) => {
      const newSet = new Set(prev.onlineUsers);
      newSet.delete(user);
      return { onlineUsers: newSet };
    });
  },
}));

export default useConnectionStore;
