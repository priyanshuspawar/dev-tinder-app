import io from "socket.io-client";

export const createSocketConnection = (geoLocation: {
  lat: number;
  lng: number;
}) => {
  if (location.hostname === "localhost") {
    return io("http://localhost:5000", {
      auth: {
        geoLocation,
      },
      withCredentials: true,
    });
  } else {
    return io("/", { path: "/api/socket.io" });
  }
};
