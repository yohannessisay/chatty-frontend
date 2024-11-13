import { UserData } from "@/pages/chats";
import { jwtDecode } from "jwt-decode";
import { io, Socket } from "socket.io-client";

const SERVER_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_SOCKET_SERVER_PROD
    : import.meta.env.VITE_SOCKET_SERVER_LOCAL;
let socket: Socket | null = null;
const token = localStorage.getItem("accessToken") ?? "";
const data: UserData = jwtDecode(token);
const userId = data.id.slice(data.id.length - 12, data.id.length);
export const initializeSocket = (): Socket => {
  if (!socket) {
    socket = io(SERVER_URL, {
      query: { userId },
      autoConnect: false,
      reconnectionAttempts: 3,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("Connected to servers");
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
