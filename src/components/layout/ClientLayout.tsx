"use client"

import { usePathname } from "next/navigation"
import SidebarLayout from "./SidebarLayout"

export default function ClientLayout({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  return (
    <>
      {isLoginPage ? (
        children
      ) : (
        <SidebarLayout session={session}>
          {children}
        </SidebarLayout>
      )}
    </>
  )
}
