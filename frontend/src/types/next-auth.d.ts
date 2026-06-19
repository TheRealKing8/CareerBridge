import "next-auth";

// Module augmentation: extends NextAuth's built-in `User`, `Session`, and
// `JWT` types with our app-specific fields. Without this, `session.user.role`
// is typed as `any` everywhere and we lose type safety at the call sites.

declare module "next-auth" {
  interface User {
    role: string;
    status: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      status: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    status: string;
  }
}
