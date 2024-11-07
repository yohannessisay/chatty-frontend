import { useEffect, useState } from "react";
import { PenBox, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
}

const initialChats: ChatItem[] = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hey, how's it going?",
    time: "2m ago",
  }
];

export default function ChatList() {
  const [searchQuery, setSearchQuery] = useState("");

  const [filteredChats, setFilteredChats] = useState<ChatItem[]>(initialChats);
  useEffect(() => {
    setFilteredChats(() => {
      return initialChats.filter(
        (chat) =>
          chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);
  return (
    <Card className="w-full col-span-1 ">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Chats</CardTitle>
        <Button variant="ghost" size="icon" className="rounded-full">
          <PenBox className="h-5 w-5" />
          <span className="sr-only">New message</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mt-4 space-y-2 ">
          <ToggleGroup
            type="single"
            orientation="vertical"
            className="flex flex-col space-y-6 items-start "
          >
            {filteredChats.map((chat) => (
              <ToggleGroupItem
                key={chat.id}
                value={chat.id}
                aria-label={`Toggle ${chat.name}`}
                className="flex items-start space-x-4 rounded-lg !mt-2 py-2 transition-colors hover:bg-muted/50 w-full h-14"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback>
                    {chat.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1  justify-items-start justify-start">
                  <p className="font-medium leading-none">{chat.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {chat.lastMessage}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground ">{chat.time}</p>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  );
}
