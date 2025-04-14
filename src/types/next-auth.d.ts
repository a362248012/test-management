import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
    };
  }
  
  interface JWT {
    id: string;
    email: string;
    role?: string; // 添加 role 字段，类型为 string 或 undefined
  }
}
