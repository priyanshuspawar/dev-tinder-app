import io from "socket.io-client";

export const createSocketConnection = () => {
  if (location.hostname === "localhost") {
    return io("http://localhost:5000", {
      auth: {},
      withCredentials: true,
    });
  } else {
    return io("/", { path: "/api/socket.io" });
  }
};
