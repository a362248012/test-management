"use client"

import { useState, useEffect, createContext, useContext } from "react"
import type { Project } from "@prisma/client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

const ProjectContext = createContext<{
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  projects: Project[]
}>({
  currentProject: null,
  setCurrentProject: () => {},
  projects: []
})

export function useProject() {
  return useContext(ProjectContext)
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        if (response.ok) {
          const data = await response.json()
          setProjects(data)
          
          // Set initial project from URL, localStorage or default to HINA
          const projectId = searchParams.get("projectId") || localStorage.getItem("currentProjectId")
          const project = projectId 
            ? data.find((p: Project) => p.id === projectId)
            : data.find((p: Project) => p.type === "HINA") || data[0]
            
          if (project) {
            setCurrentProject(project)
            localStorage.setItem("currentProjectId", project.id)
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      }
    }
    fetchProjects()
  }, [searchParams])

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject, projects }}>
      {children}
    </ProjectContext.Provider>
  )
}

export default function ProjectSwitcher() {
  const { currentProject, setCurrentProject } = useProject()
  const [projects, setProjects] = useState<Project[]>([])
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects")
        if (response.ok) {
          const data = await response.json()
          setProjects(data)
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      }
    }
    fetchProjects()
  }, [])

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setCurrentProject(project)
      localStorage.setItem("currentProjectId", projectId)
      // Always update URL with projectId
      const params = new URLSearchParams(window.location.search)
      params.set("projectId", projectId)
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  return (
    <div className="mb-6">
      <Select 
        value={currentProject?.id || ""} 
        onValueChange={handleProjectChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="选择项目" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
