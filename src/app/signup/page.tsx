"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  UserCheck,
  Shield,
} from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as "user" | "organizer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast.success("Account created successfully! Please sign in.");
      router.push("/login?registered=true");
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message.includes("already exists")) {
        toast.error(
          "Email already registered. Please use a different email or sign in."
        );
      } else {
        toast.error(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value as "user" | "organizer",
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-primary/5 to-teal-500/10" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="glass border-white/20 shadow-2xl hover-glass">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-xl" />
          <CardHeader className="space-y-2 text-center relative z-10">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-primary rounded-xl flex items-center justify-center shadow-lg animate-glow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">EventHub</span>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground animate-fade-in">
              Create Account
            </CardTitle>
            <CardDescription
              className="text-muted-foreground animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Join thousands of event organizers and attendees
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div
                className="space-y-2 animate-slide-in"
                style={{ animationDelay: "0.3s" }}
              >
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pl-10 glass border-white/20 focus-glass hover:bg-white/10 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Email */}
              <div
                className="space-y-2 animate-slide-in"
                style={{ animationDelay: "0.4s" }}
              >
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 glass border-white/20 focus-glass hover:bg-white/10 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div
                className="space-y-2 animate-slide-in"
                style={{ animationDelay: "0.5s" }}
              >
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="pl-10 pr-10 glass border-white/20 focus-glass hover:bg-white/10 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div
                className="space-y-2 animate-slide-in"
                style={{ animationDelay: "0.6s" }}
              >
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className="pl-10 pr-10 glass border-white/20 focus-glass hover:bg-white/10 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Account Type */}
              <div
                className="space-y-3 animate-slide-in"
                style={{ animationDelay: "0.7s" }}
              >
                <Label className="text-sm font-medium text-foreground">
                  Account Type
                </Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  className="grid grid-cols-1 gap-3"
                >
                  <label
                    htmlFor="user"
                    className="flex items-center space-x-3 p-4 glass border-white/20 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  >
                    <RadioGroupItem value="user" id="user" />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <UserCheck className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          Attendee
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Join and register for events
                        </div>
                      </div>
                    </div>
                  </label>

                  <label
                    htmlFor="organizer"
                    className="flex items-center space-x-3 p-4 glass border-white/20 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  >
                    <RadioGroupItem value="organizer" id="organizer" />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Shield className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          Organizer
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Create and manage events
                        </div>
                      </div>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-primary hover:from-purple-600 hover:to-primary/90 text-white glass border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in"
                style={{ animationDelay: "0.8s" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Already have account */}
            <div
              className="text-center space-y-4 animate-fade-in"
              style={{ animationDelay: "0.9s" }}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 glass bg-white/5 text-muted-foreground rounded-full">
                    Already have an account?
                  </span>
                </div>
              </div>

              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full glass border-white/20 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
