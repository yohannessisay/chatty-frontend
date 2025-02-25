import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MagnifyingGlassIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { getData } from "@/services/apiService";
import { jwtDecode } from "jwt-decode";
import { CurrentActiveChat, UserData } from "./chats";
import { useSocket } from "@/services/contexts";
import { timeAgo } from "@/services/utils";
import {
  fetchPublicKeyFromBackend,
  getPublicKey,
  handleInitialChatLists,
  savePublicKey,
} from "@/services/pouchDBService";
import { generateKeyPair } from "@/services/encrypt";

interface ChatItem {
  id: string;
  firstName: string;
  lastName: string;
  lastMessage?: string;
  lastSeen: string;
}
interface ChildProps {
  updateSelectedChat: (activeChat: CurrentActiveChat) => void;
  setCurrentPublicKey:(publicKey:string)=>void;
}
export default function ChatList({ updateSelectedChat,setCurrentPublicKey }: ChildProps) {
  const token = localStorage.getItem("accessToken") ?? "";
  const [peopleList, setPeopleList] = useState<ChatItem[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatItem[]>(peopleList);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setIsLoading] = useState(false);

  let data: UserData;
  try {
    data = jwtDecode(token);
  } catch (error) {
    console.log(error);
  }
  const { socket } = useSocket();
  const setSelectedChat = async (chat: ChatItem) => {
    const recipientId = chat.id;
    const loggedInUserId = data.id;
    if (!socket) return;

    const room = [loggedInUserId, recipientId].join("_");

    updateSelectedChat({
      roomId: room,
      recipientName: `${chat.firstName} ${chat.lastName}`,
      recipientId: recipientId,
      lastSeen: chat.lastSeen,
    });
    socket.emit("joinRoom", { loggedInUserId, recipientId });

    const resLocal = await getPublicKey(recipientId);


    if (resLocal === null) {
      const backRes = await fetchPublicKeyFromBackend(recipientId); 

      if (backRes && backRes.success == true) {
        await savePublicKey(recipientId, backRes.publicKey, loggedInUserId);
      } else {
        const publicKey = await generateKeyPair();
        socket.emit("send-public-key", {
          recipientId: recipientId,
          publicKey,
        });
        await savePublicKey(
          recipientId,
          publicKey.publicKey,
          loggedInUserId,
          publicKey.privateKey
        );
      }
    } else {
      setCurrentPublicKey(resLocal.publicKey)
    }

    return () => {
      socket.off("connect");
      socket.off("message");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(() => {
    setFilteredChats(() => {
      return peopleList.filter(
        (chat: ChatItem) =>
          chat.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (chat.lastMessage != undefined
            ? chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
            : "")
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    setIsLoading(() => {
      return true;
    });
    const resp = await getData("users");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedList = resp.users.map((user: any) => {
      return {
        id: user.id,
        firstName: user.firstname,
        lastName: user.lastname,
        lastMessage: undefined,
        lastSeen: timeAgo(user.lastSeen),
      };
    });
    await handleInitialChatLists(mappedList);

    setPeopleList(() => {
      return mappedList;
    });
    setFilteredChats(() => {
      return mappedList;
    });
    setIsLoading(() => {
      return false;
    });
  };
  return (
    <Card className="w-full col-span-1 ">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Chats</CardTitle>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Pencil1Icon className="h-5 w-5" />
          <span className="sr-only">New message</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mt-4 space-y-2 ">
          {loading ? (
            <div className="flex justify-center items-center">
              {" "}
              <div
                className="w-12 h-12 rounded-full animate-spin
                    border border-solid border-yellow-500 border-t-transparent"
              ></div>
            </div>
          ) : (
            <ToggleGroup
              type="single"
              orientation="vertical"
              className="flex flex-col space-y-6 items-start "
            >
              {filteredChats.map((chat) =>
                chat.id !== data.id ? (
                  <ToggleGroupItem
                    key={chat.id}
                    value={chat.id}
                    aria-label={`Toggle ${chat.firstName}`}
                    onClick={() => setSelectedChat(chat)}
                    className="flex items-start space-x-4 rounded-lg !mt-2 py-2 transition-colors hover:bg-muted/50 w-full h-14"
                  >
                    <div className="flex-1 space-y-1  justify-items-start justify-start">
                      <p className="font-medium leading-none">{`${chat.firstName} ${chat.lastName}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {chat.lastMessage}
                      </p>
                    </div>
                    <span
                      className={`text-xs text-muted-foreground ${
                        chat.lastSeen === "Active"
                          ? "bg-green-600 rounded-full h-3 w-3"
                          : ""
                      }`}
                    >
                      {chat.lastSeen !== "Active" ? chat.lastSeen : ""}
                    </span>
                  </ToggleGroupItem>
                ) : (
                  ""
                )
              )}
            </ToggleGroup>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
