
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "./auth-layout";
import { Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { countries } from "@/lib/countries";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import type { User } from "@/lib/types";
import { triggerWelcomeEmail } from "@/lib/actions";

// Zod schema for login form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(1, { message: "Password is required." }), // Login doesn't need min 8 chars
  rememberMe: z.boolean().default(false).optional(),
});

// Zod schema for signup form validation
const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phoneNumber: z.string().min(1, { message: "Phone number is required." }),
  country: z.string().min(1, { message: "Please select a country." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});


function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name: string) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}


export function AuthForm({ type }: { type: "login" | "signup" }) {
  const router = useRouter();
  const isLogin = type === "login";
  // Determine which schema to use based on the form type
  const schema = isLogin ? loginSchema : signupSchema;
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isLogin 
      ? { email: "", password: "", rememberMe: false } 
      : { name: "", username: "", email: "", phoneNumber: "", country: "", password: "", confirmPassword: "" },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    // In this prototype, we'll use localStorage to manage a list of users.
    const getUsers = (): User[] => {
      if (typeof window === 'undefined') return [];
      const usersJson = localStorage.getItem('users');
      return usersJson ? JSON.parse(usersJson) : [];
    };

    const saveUsers = (users: User[]) => {
      localStorage.setItem('users', JSON.stringify(users));
    };

    const users = getUsers();

    if (isLogin) {
      // Login logic
      const loginValues = values as z.infer<typeof loginSchema>;
      const user = users.find(u => u.email === loginValues.email);

      // In a real app, you would verify the hashed password. Here we just check for existence.
      if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        setCookie('loggedInUser', JSON.stringify(user), loginValues.rememberMe ? 7 : 0);
        router.push("/dashboard");
      } else {
        setError("Invalid email or password.");
        setIsLoading(false);
      }
    } else {
      // Signup logic
      const signupValues = values as z.infer<typeof signupSchema>;

      // Check if email already exists
      if (users.some(u => u.email === signupValues.email)) {
        setError("An account with this email already exists.");
        setIsLoading(false);
        return;
      }
      
      // Check if username already exists
      if (users.some(u => u.username.toLowerCase() === signupValues.username.toLowerCase())) {
        setError("This username is already taken. Please choose another one.");
        setIsLoading(false);
        return;
      }

      const newUser: User = {
        id: `usr_${Math.random().toString(36).substr(2, 9)}`,
        name: signupValues.name,
        username: signupValues.username,
        email: signupValues.email,
        phoneNumber: signupValues.phoneNumber,
        country: signupValues.country,
        balance: 200.00,
        joinDate: new Date().toISOString().split('T')[0],
        transactions: [
          { id: "txn_bonus_001", type: "Bonus", asset: "USDT", amount: 200, status: "Completed", date: new Date().toISOString().split('T')[0] },
        ],
        // In a real app, you MUST hash the password before saving.
        // For this prototype, we are omitting the password field for security.
      };
      
      // We don't await this so it doesn't block the UI
      triggerWelcomeEmail({ to: newUser.email, name: newUser.name });

      // Add the new user to our list and save
      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);

      // Log the user in
      localStorage.setItem('loggedInUser', JSON.stringify(newUser));
      setCookie('loggedInUser', JSON.stringify(newUser), 7); // Set cookie for server-side access
      localStorage.setItem('showBonusPopup', 'true'); // Flag to show popup
      router.push("/dashboard");
    }
  };
  
  return (
    <AuthLayout>
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isLogin ? "Welcome Back" : "Create an Account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to access your dashboard."
              : "Enter your details to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Display general form error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Elon Musk" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="elon" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 234 567 890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <ScrollArea className="h-72">
                                  {countries.map((country) => (
                                    <SelectItem key={country.code} value={country.name}>
                                      {country.name}
                                    </SelectItem>
                                  ))}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                </>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="user@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                           type={showPassword ? "text" : "password"}
                           placeholder="••••••••"
                          {...field}
                        />
                         <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {isLogin && (
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Remember me
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                   <Link href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (isLogin ? "Signing In..." : "Creating Account...") : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign In
                </Link>
              </>
            )}
          </div>
           <div className="text-center text-sm">
            <Link href="/" className="text-muted-foreground hover:underline">
                Cancel
            </Link>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
