import { io } from "socket.io-client";

const SOCKET_URL = " https://train-chat.onrender.com";
export const socket = io(SOCKET_URL, {
  autoConnect: true,
});
