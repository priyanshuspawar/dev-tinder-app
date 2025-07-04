import { Socket } from "socket.io-client";
import { create } from "zustand";

interface SocketStore {
  socket: Socket | null;
  setSocket: (socket: Socket) => void;
}

const useSocket = create<SocketStore>((set) => ({
  socket: null,
  setSocket: (socket) => {
    set({
      socket,
    });
  },
}));

export default useSocket;
