import ChatList from "./chatList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocket } from "@/services/contexts";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { jwtDecode } from "jwt-decode";
import {
  closeDatabase,
  Message,
  getDecryptedMessages,
  saveMissedMessage,
  saveIncomingMessage,
  getDecryptedMessage,
  saveMyMessage,
} from "../services/pouchDBService";

import { ChatAuth } from "./chatAuth";

export interface UserData {
  username: string;
  id: string;
}

export interface IncomingMessage {
  content: string;
  senderId: string;
  roomId: string;
  recipientId: string;
  senderUserName: string;
}

export interface CurrentActiveChat {
  roomId: string;
  recipientName: string;
  recipientId: string;
  lastSeen: string;
}

export default function Chats() {
  const { socket } = useSocket();
  const token = localStorage.getItem("accessToken") ?? "";
  const [newMessage, setNewMessage] = useState<string>("");
  const roomId = useRef("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatDetail, setCurrentChatDetail] =
    useState<CurrentActiveChat>();
  const currentPublicKey = useRef("");
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isChatAuthDialogOpen, setIsChatAuthDialogOpen] = useState(false);
  const data: UserData = jwtDecode(token);
  const handlePublicKeyChange = (newPublicKey: string) => {
    currentPublicKey.current = newPublicKey;
  };
  const handleSendMessage = useCallback(async () => {
    if (socket && newMessage.trim()) {
      const chat: Message = {
        content: newMessage.trim(),
        senderId: data.id,
        senderUserName: data.username,
        recipientId: currentChatDetail?.recipientId || "",
        sentTimeStamp: new Date().toISOString(),
        roomId: roomId.current,
      };

      setMessages((prev) => [...prev, chat]);

      setNewMessage("");
      const savedMessage = await saveMyMessage(
        currentChatDetail?.recipientId || "",
        chat,
        currentPublicKey.current
      );
      if (savedMessage != false) {
        socket.emit("message", {
          data: savedMessage,
          recipientId: currentChatDetail?.recipientId,
        });
      } else {
        console.error("Failed to save message");
      }
    }
  }, [
    socket,
    newMessage,
    data.id,
    data.username,
    currentChatDetail?.recipientId,
  ]);

  const handleCurrentChatChange = useCallback(
    async (activeChat: CurrentActiveChat) => {
      setCurrentChatDetail(() => {
        return activeChat;
      });
      setMessages([]);
      roomId.current = activeChat.roomId;
      const messages = await getDecryptedMessages(activeChat.recipientId);

      // if (messages.length === 0) {
      //   setIsChatAuthDialogOpen(() => {
      //     return true;
      //   });
      // }

      setMessages(messages);
    },
    []
  );

  const updateMessageInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessage(e.target.value);
    },
    []
  );

  useEffect(() => {
    if (socket) {
      socket.on(
        "roomJoined",
        (incomingMessage: {
          senderId: string;
          recipientId: string;
          roomId: string;
        }) => {
          roomId.current = incomingMessage.roomId;
        }
      );

      socket.on("missedMessages", async (message) => {
        const missedMessage = message.messages;
        if (missedMessage && missedMessage.success) {
          const chat: Message = {
            content: missedMessage.content,
            senderId: missedMessage.senderId,
            senderUserName: "",
            recipientId: missedMessage.recipientId,
            sentTimeStamp: missedMessage.timestamp,
            roomId: missedMessage.roomId,
          };

          const success = await saveMissedMessage(
            chat?.senderId || "",
            chat,
            missedMessage.id
          );
          if (!success) {
            console.error("Failed to save incoming message");
            return;
          }
          if (currentChatDetail?.recipientId === missedMessage.senderId) {
            setMessages((prevMessages) => [...prevMessages, chat]);
          }
        }
      });

      socket.on("receiveMessage", async (receivedMessage: IncomingMessage) => {
        if (receivedMessage.senderId !== data.id) {
          const chat: Message = {
            content: receivedMessage.content,
            senderId: receivedMessage.senderId,
            senderUserName: receivedMessage.senderUserName,
            recipientId: receivedMessage.recipientId,
            sentTimeStamp: new Date().toISOString(),
            roomId: roomId.current,
          };

          const success = await saveIncomingMessage(chat?.senderId || "", chat);
          if (!success) {
            console.error("Failed to save incoming message");
          }
          if (currentChatDetail?.recipientId === receivedMessage.senderId) {
            const decryptedContent = await getDecryptedMessage(
              receivedMessage?.senderId,
              receivedMessage.content
            );
            setMessages((prevMessages) => [
              ...prevMessages,
              { ...chat, content: decryptedContent },
            ]);
          }
        }
      });

      socket.on("alreadyInRoom", (message: string) => {
        console.log("ALREADY IN ROOM", message);
      });
      socket.on("send-public-key", async ({ publicKey, senderId }) => {
        console.log(publicKey, senderId);

        // await savePublicKey(senderId, publicKey);
      });
      return () => {
        socket.off("receiveMessage");
        socket.off("missedMessages");
      };
    }
  }, [socket, data, currentChatDetail]);

  useEffect(() => {
    return () => {
      if (currentChatDetail?.recipientId) {
        closeDatabase(currentChatDetail.recipientId);
      }
    };
  }, [currentChatDetail?.recipientId]);
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="grid grid-cols-3 gap-4">
      <ChatAuth isDialogOpen={isChatAuthDialogOpen}></ChatAuth>
      <ChatList
        updateSelectedChat={handleCurrentChatChange}
        setCurrentPublicKey={handlePublicKeyChange}
      />
      {currentChatDetail?.recipientId && (
        <>
          <Card className="h-[580px] flex flex-col w-full col-span-2">
            <CardHeader className="flex flex-row items-center gap-3 p-4">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src="/placeholder-avatar.jpg"
                  alt="User's avatar"
                />
                <AvatarFallback>
                  {currentChatDetail?.recipientName.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h2 className="text-sm font-semibold">
                  {currentChatDetail?.recipientName}
                </h2>
                <p
                  className={`text-xs ${
                    currentChatDetail?.lastSeen == "Active"
                      ? "text-green-500"
                      : ""
                  }`}
                >
                  {currentChatDetail?.lastSeen}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <span className="sr-only">Video call</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M15 10l5 5V5l-5 5z" />
                    <rect width="14" height="14" x="3" y="5" rx="2" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <span className="sr-only">Voice call</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <ScrollArea className="h-[400px] overflow-hidden p-4 border rounded-md">
                {messages.length > 0
                  ? messages.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-4 flex ${
                          message.senderId === data.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`py-2 px-4 shadow-md max-w-[70%] rounded-xl break-all ${
                            message.senderId === data.id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))
                  : "No messages yet"}
                <div ref={messageEndRef} />
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex w-full items-center space-x-2"
              >
                <Input
                  id="message"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={updateMessageInput}
                  className="flex-grow"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <ChatBubbleIcon className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
