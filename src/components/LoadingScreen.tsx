import { Brain } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <Brain className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Flint AI</h2>
          <p className="text-muted-foreground">Loading your AI tutoring experience...</p>
        </div>
        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}