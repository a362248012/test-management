"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <form 
        className="space-y-4 w-full max-w-sm p-8 border rounded-lg shadow-lg"
        action={async (formData) => {
          try {
            const formDataObj = new FormData();
            formDataObj.append("name", formData.get("name") as string);
            formDataObj.append("email", formData.get("email") as string);
            formDataObj.append("password", formData.get("password") as string);
            
            const imageFile = formData.get("image");
            if (imageFile instanceof File) {
              formDataObj.append("image", imageFile);
            }

            // 1. 注册用户
            const response = await fetch('/api/register', {
              method: 'POST',
              body: formDataObj,
            });

            if (!response.ok) {
              throw new Error(await response.text());
            }

            // 2. 自动登录
            await signIn("credentials", {
              name: formData.get("name"),
              email: formData.get("email"),
              password: formData.get("password"),
              redirect: true,
              callbackUrl: "/"
            });
          } catch (error) {
            console.error("注册失败:", error);
            throw error;
          }
        }}
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">注册新账户</h1>
          <p className="text-sm text-gray-500">输入邮箱和密码创建账户</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">名字</Label>
            <Input
              id="name"
              name="name"
              type="name"
              placeholder="name"
              required
            />
          </div>
          <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">头像</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
            />
          </div>

          <Button className="w-full" type="submit">
            注册
          </Button>
        </div>
      </form>
    </div>
  );
}
