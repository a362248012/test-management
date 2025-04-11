declare module "@/components/ui/tabs" {
  import * as React from "react"

  interface TabsProps<T = string> extends React.HTMLAttributes<HTMLDivElement> {
    value: T
    onValueChange?: (value: T) => void
    children?: React.ReactNode
  }

  interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

  interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
    'data-state'?: 'active' | 'inactive'
    onClick?: () => void
  }

  interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string
    onValueChange?: (value: string) => void
    children?: React.ReactNode
  }

  export const Tabs: <T = string>(
    props: React.PropsWithChildren<TabsProps<T>> & 
    React.RefAttributes<HTMLDivElement>
  ) => React.ReactElement
  
  export const TabsList: React.ForwardRefExoticComponent<
    TabsListProps & React.RefAttributes<HTMLDivElement>
  >
  
  export const TabsTrigger: React.ForwardRefExoticComponent<
    TabsTriggerProps & React.RefAttributes<HTMLButtonElement>
  >
}
