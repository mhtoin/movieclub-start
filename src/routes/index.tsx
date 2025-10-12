import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="p-4 w-full h-screen flex items-center justify-center">
      Hello, Movie Club!
    </div>
  )
}
