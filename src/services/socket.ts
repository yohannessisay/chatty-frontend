import { io, Socket } from "socket.io-client";

const SERVER_URL =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_SOCKET_SERVER_PROD
    : import.meta.env.VITE_SOCKET_SERVER_LOCAL;
let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      reconnectionAttempts: 3,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }

  return socket;
};

export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
