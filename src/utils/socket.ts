import io from "socket.io-client";

// Same API origin as REST calls; the server authenticates with the cookie and
// requires geoLocation in the handshake (it saves the user's location).
export const createSocketConnection = (geoLocation: {
  lat: number;
  lng: number;
}) =>
  io(import.meta.env.VITE_API_URL, {
    auth: { geoLocation },
    withCredentials: true,
  });
