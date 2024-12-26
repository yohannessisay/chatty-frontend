import { useAuth } from "@/services/contexts";
import LoginScreen from "./auth/login";
export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  return (
    <div>
      <h1 className="text-3xl text-center">
        {isAuthenticated()
          ? "Welcome to your dashboard!"
          : "Welcome, please sign in or register here to use Chatty"}
      </h1>
      {!isAuthenticated() && <LoginScreen />}
    </div>
  );
}
