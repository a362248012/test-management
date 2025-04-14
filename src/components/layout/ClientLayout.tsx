"use client"

import { usePathname } from "next/navigation"
import SidebarLayout from "./SidebarLayout"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/context/theme"
import { ProjectProvider } from "@/contexts/ProjectContext"

export default function ClientLayout({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login" || pathname === "/register"

  return (
    <>
      {isLoginPage ? (
        children
      ) : (
        <ThemeProvider>
          <SessionProvider session={session}>
            <ProjectProvider>
              <SidebarLayout session={session}>
                {children}
              </SidebarLayout>
            </ProjectProvider>
          </SessionProvider>
        </ThemeProvider>
      )}
    </>
  )
}
