import { UserData } from "@/pages/chats";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SERVER_URL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_SOCKET_SERVER_PROD
    : import.meta.env.VITE_SOCKET_SERVER_LOCAL;

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const token = localStorage.getItem("accessToken") ?? "";

  useEffect(() => {
    if (token.length > 0) {
      const data: UserData = jwtDecode(token);
      const userId = data.id.slice(data.id.length - 12, data.id.length);
      const socketInstance = io(SERVER_URL, {
        query: { userId },
        autoConnect: false,
        reconnectionAttempts: 3,
        timeout: 10000,
      });
      socketInstance.connect();
      setSocket(socketInstance);

      socketInstance.on("connect", () => {
        console.log("Connected to server");
      });

      socketInstance.on("disconnect", () => {
        console.log("Disconnected from server");
      });
      return () => {
        socketInstance.disconnect();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
