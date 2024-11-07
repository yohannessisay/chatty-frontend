import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { encryptData } from "@/services/encrypt";
import LoginScreen from "./login";

export default function Dashboard() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const registerUserApi =
    import.meta.env.MODE === "production"
      ? import.meta.env.VITE_SOCKET_SERVER_PROD
      : import.meta.env.VITE_SOCKET_SERVER_LOCAL;
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      firstname: formData.get("firstName") as string,
      lastname: formData.get("lastName") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    if (!data.firstname || !data.lastname || !data.username || !data.password) {
      setError("All fields are required");
      return;
    }

    await fetch(`${registerUserApi}register`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).then(async (response: any) => {
      if (response.success === true) {
        // const res = await fetch(`${registerUserApi}user/${data.username}`, {
        //     method: "GET",
        //     body: JSON.stringify(data),
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //   });
      }
    });

    setError(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const resp = await encryptData("");
  //     console.log(resp); 
  //   };

  //   fetchData();
  // }, []);
  return (
    <div>
      <h1 className="text-3xl text-center">Welcome, please sign in or register here to use chatty</h1>
      <LoginScreen></LoginScreen>
      {/* <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>
            Create a new account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" placeholder="John" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" placeholder="Doe" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" placeholder="johndoe" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full mt-4">
              Register
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="#" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card> */}
    </div>
  );
}
