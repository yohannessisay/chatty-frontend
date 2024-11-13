import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { ChatBubbleIcon, HomeIcon } from "@radix-ui/react-icons";

const items = [
  {
    title: "Home",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Chats",
    url: "/chats",
    icon: ChatBubbleIcon,
  },
];

export function AppSidebar() {
  const location = useLocation();
  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="bg-gray-100 dark:bg-gray-900"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-black text-xl mb-12">
            Chatty
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="">
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className={` ${
                    location.pathname === item.url
                      ? "bg-primary  text-white  rounded-md shadow-md"
                      : ""
                  }`}
                >
                  <SidebarMenuButton asChild className="hover:bg-primary hover:text-white duration-300 transition-all">
                    <Link to={item.url}>
                      <item.icon />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
