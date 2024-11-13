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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getData, postData } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { EyeClosedIcon, EyeOpenIcon, StopIcon } from "@radix-ui/react-icons";

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast()

  const [error, setError] = useState<string | null>(null);
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
      toast({
        variant: "destructive",
        title: "Fill out all the fields.", 
      })
      return;
    }

    const postResponse = await postData('register', data);

    if (postResponse.success === true) {
      const getResponse = await getData(`user/${data.username}`);

      console.log(getResponse);
    }

    setError(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mt-24 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-auto">
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
                      <EyeClosedIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeOpenIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <StopIcon className="h-4 w-4" />
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
            <Link to={"/login"}>
              {" "}
              <span className="text-primary hover:underline">Sign in</span>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
