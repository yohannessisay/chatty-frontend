import ChatList from "./chatList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocket } from "@/services/contexts";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { jwtDecode } from "jwt-decode";

export interface UserData {
  username: string;
  id: string;
}

export interface IncomingMessage {
  content: string;
  senderId: string;
  roomId: string;
  senderUserName: string;
}

export interface CurrentActiveChat {
  roomId: string;
  recipientName: string;
  recipientId: string;
}

export default function Chats() {
  const { socket } = useSocket();
  const token = localStorage.getItem("accessToken") ?? "";
  const [newMessage, setNewMessage] = useState<string>("");
  const roomId = useRef("");
  const [messages, setMessages] = useState<
    {
      content: string;
      senderId: string;
      recipientId: string;
      timestamp: string;
    }[]
  >([]);
  const [currentChatDetail, setCurrentChatDetail] =
    useState<CurrentActiveChat>();
  const data: UserData = jwtDecode(token);

  const handleSendMessage = async () => {
    if (socket && newMessage.trim()) {
      const chat = {
        content: newMessage.trim(),
        senderId: data.id,
        senderUserName: data.username,
        recipientId: currentChatDetail?.recipientId || "",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, chat]);

      socket.emit("message", {
        data: newMessage,
        recipientId: currentChatDetail?.recipientId,
      });
      setNewMessage("");
    }
  };

  const updateMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

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

      socket.on("missedMessages", (missedMessages) => {
        console.log("MISSED", missedMessages);
      });

      socket.on("receiveMessage", (receivedMessage: IncomingMessage) => {
        if (receivedMessage.senderId !== data.id) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              content: receivedMessage.content,
              senderId: receivedMessage.senderId,
              recipientId: receivedMessage.roomId,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      });

      socket.on("alreadyInRoom", (message: string) => {
        console.log("ALREADY IN ROOM", message);
      });

      return () => {
        socket.off("receiveMessage");
        socket.off("missedMessages");
      };
    }
  }, [socket]);

  return (
    <div className="grid grid-cols-3 gap-4">
      <ChatList
        updateSelectedChat={(activeChat: CurrentActiveChat) => {
          setCurrentChatDetail(activeChat);
        }}
      />
      <Card className="h-[580px] flex flex-col w-full col-span-2">
        <CardHeader className="flex flex-row items-center gap-3 p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User's avatar" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold">Jane Doe</h2>
            <p className="text-xs text-green-500">Online</p>
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
                      className={`p-3 shadow-md max-w-[70%] rounded-3xl ${
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
    </div>
  );
}
