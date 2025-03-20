import { ConnectionRequests, feedUser } from "@/queries/types";
import { create } from "zustand";

interface ConnectionStore {
  connectionRequests: ConnectionRequests;
  userConnections: feedUser[];
  setConnectionRequests: (updatedRequests: ConnectionRequests) => void;
  setUserConnections: (updatedConnections: feedUser[]) => void;
}

const useConnectionStore = create<ConnectionStore>((set) => ({
  connectionRequests: [],
  userConnections: [],
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
}));

export default useConnectionStore;
