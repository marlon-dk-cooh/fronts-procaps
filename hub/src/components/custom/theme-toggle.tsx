import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/context/ThemeContext"

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      className="bg-[#00A19B] hover:bg-[#1B4B5A] border-0 !text-white h-10"
      onClick={toggleTheme}
    >
      {isDarkMode ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}