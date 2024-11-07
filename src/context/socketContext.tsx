import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SERVER_URL =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_SOCKET_SERVER_PROD
    : import.meta.env.VITE_SOCKET_SERVER_LOCAL;

// Define the context type
interface SocketContextType {
  socket: Socket | null;
}

// Create the context with a default value
const SocketContext = createContext<SocketContextType>({ socket: null });

// Export a custom hook to use the socket context
export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize and connect the socket
    const socketInstance = io(SERVER_URL, {
      autoConnect: false,
      reconnectionAttempts: 3,
      timeout: 10000,
    });

    socketInstance.connect();
    setSocket(socketInstance);

    // Log connection events
    socketInstance.on("connect", () => {
      console.log("Connected to server");
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
