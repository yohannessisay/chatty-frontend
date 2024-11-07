import { io } from "socket.io-client";

const URL =
  process.env.NODE_ENV === "production"
    ? process.env.SOCKET_SERVER_PROD
    : process.env.SOCKET_SERVER_LOCAL;

export const socket = io(URL);
