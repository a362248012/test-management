"use server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const register = async (data: { 
  name: string;
  email: string; 
  password: string 
}) => {
  const exists = await prisma.user.findUnique({
    where: { email: data.email }
  });
  
  if (exists) {
    throw new Error("用户已存在");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword
    }
  });

  return user;
};

export const login = async (credentials: { 
  name?: string;
  email?: string; 
  password?: string 
}) => {
  if (!credentials?.email || !credentials?.password) {
    throw new Error("邮箱和密码不能为空");
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email }
  });

  if (!user || !user.password) {
    throw new Error("用户不存在");
  }

  const isValid = await bcrypt.compare(credentials.password, user.password);
  
  if (!isValid) {
    throw new Error("密码错误");
  }

  return user;
};
