"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { encryptData } from "@/services/encrypt";
import { postData } from "@/services/apiService";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/services/contexts";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginData = {
      [await encryptData("email")]: await encryptData(email),
      [await encryptData("password")]: await encryptData(password),
    };
    const res = await postData("login", loginData);

    if (res && res.success) {
      toast({
        variant: "default",
        title: res.message,
      }); 
      login(res.accessToken);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Credentials",
      });
    }
  };

  return (
    <div className="mt-24 flex items-center justify-center ">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Please enter your details to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email/Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeClosedIcon className="h-4 w-4 text-gray-500" />
                  ) : (
                    <EyeOpenIcon className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="link">Forgot password?</Button>
          <Link to={"/register"}>
            {" "}
            <Button variant="link">Sign up</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
