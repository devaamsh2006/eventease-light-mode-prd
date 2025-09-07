import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { users } from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: users,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  socialProviders: {},
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        validator: (value: string) => {
          if (!["user", "organizer"].includes(value)) {
            throw new Error("Invalid role. Must be 'user' or 'organizer'");
          }
          return value;
        },
      },
    },
    modelName: "user",
  },
  account: {
    modelName: "account",
  },
  session: {
    modelName: "session",
    cookieName: "better-auth.session_token",
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  cookies: {
    sessionToken: {
      name: "better-auth.session_token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  rateLimit: {
    window: 60,
    max: 100,
  },
  advanced: {
    generateId: false,
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  trustedOrigins: process.env.NODE_ENV === "production" 
    ? [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"]
    : ["http://localhost:3000"],
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  logger: {
    level: process.env.NODE_ENV === "production" ? "error" : "info",
  },
});

export type User = typeof auth.$Infer.User & {
  role: "user" | "organizer";
};

export type Session = typeof auth.$Infer.Session;

export const { 
  signIn, 
  signUp, 
  signOut, 
  getSession, 
  listSessions,
  revokeSession,
  revokeSessions,
  changePassword,
  resetPassword,
  sendResetPassword,
  verifyEmail,
  sendVerificationEmail,
} = auth;

// Helper function to get current user from request
export async function getCurrentUser(request: Request): Promise<User | null> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return null;
    }

    return session.user as User;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Helper function to check if user has specific role
export function hasRole(user: User | null, role: "user" | "organizer"): boolean {
  if (!user) return false;
  return user.role === role;
}

// Helper function to check if user has organizer role
export function isOrganizer(user: User | null): boolean {
  return hasRole(user, "organizer");
}

// Helper function to check if user has user role
export function isUser(user: User | null): boolean {
  return hasRole(user, "user");
}

// Middleware helper for role-based access
export async function requireRole(
  request: Request, 
  requiredRole: "user" | "organizer"
): Promise<{ user: User; success: true } | { error: string; status: number; success: false }> {
  const user = await getCurrentUser(request);
  
  if (!user) {
    return {
      error: "Authentication required",
      status: 401,
      success: false
    };
  }

  if (!hasRole(user, requiredRole)) {
    return {
      error: `Access denied. ${requiredRole} role required`,
      status: 403,
      success: false
    };
  }

  return {
    user,
    success: true
  };
}

// Middleware helper for organizer access
export async function requireOrganizer(
  request: Request
): Promise<{ user: User; success: true } | { error: string; status: number; success: false }> {
  return requireRole(request, "organizer");
}

// Default export for the auth instance
export default auth;