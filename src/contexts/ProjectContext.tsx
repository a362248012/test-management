"use client"
import { createContext, useContext, ReactNode, useState, useEffect } from "react"
import { Project } from "@prisma/client"

type ProjectContextType = {
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
}

const ProjectContext = createContext<ProjectContextType>({
  currentProject: null,
  setCurrentProject: () => {}
})

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  useEffect(() => {
    // 从localStorage初始化项目
    const savedProject = localStorage.getItem("currentProject")
    if (savedProject) {
      try {
        setCurrentProject(JSON.parse(savedProject))
      } catch (e) {
        console.error("Failed to parse saved project", e)
      }
    }
  }, [])

  useEffect(() => {
    // 保存项目到localStorage
    if (currentProject) {
      localStorage.setItem("currentProject", JSON.stringify(currentProject))
    } else {
      localStorage.removeItem("currentProject")
    }
  }, [currentProject])

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useCurrentProject() {
  return useContext(ProjectContext)
}
