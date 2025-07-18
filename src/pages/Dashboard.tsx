import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Brain, MessageSquare, Users, TrendingUp, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import { blink } from '../blink/client'

interface Tutor {
  id: string
  name: string
  subject: string
  personality: string
  description: string
  createdAt: string
  chatCount: number
  isActive: boolean
}

export default function Dashboard() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  const loadTutors = async (userId: string) => {
    try {
      const userTutors = await blink.db.tutors.list({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
      setTutors(userTutors)
    } catch (error) {
      console.error('Failed to load tutors:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user && !state.isLoading) {
        loadTutors(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  const deleteTutor = async (tutorId: string) => {
    try {
      await blink.db.tutors.delete(tutorId)
      setTutors(tutors.filter(t => t.id !== tutorId))
    } catch (error) {
      console.error('Failed to delete tutor:', error)
    }
  }

  const stats = [
    {
      title: 'Total Tutors',
      value: tutors.length,
      icon: Brain,
      color: 'text-primary'
    },
    {
      title: 'Active Chats',
      value: tutors.reduce((sum, t) => sum + t.chatCount, 0),
      icon: MessageSquare,
      color: 'text-accent'
    },
    {
      title: 'Students Helped',
      value: tutors.reduce((sum, t) => sum + t.chatCount * 3, 0), // Estimated
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'This Month',
      value: tutors.filter(t => {
        const created = new Date(t.createdAt)
        const now = new Date()
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      }).length,
      icon: TrendingUp,
      color: 'text-blue-600'
    }
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Brain className="w-16 h-16 text-primary mx-auto" />
          <h2 className="text-2xl font-semibold">Please sign in to view your dashboard</h2>
          <Button onClick={() => blink.auth.login()}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Manage your AI tutors and track their performance.
            </p>
          </div>
          <Link to="/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create New Tutor
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tutors Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Your AI Tutors</h2>
            <Badge variant="secondary" className="px-3 py-1">
              {tutors.length} {tutors.length === 1 ? 'Tutor' : 'Tutors'}
            </Badge>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tutors.length === 0 ? (
            <Card className="p-12 text-center">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No tutors yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first AI tutor to get started with personalized learning experiences.
              </p>
              <Link to="/create">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Tutor
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map((tutor) => (
                <Card key={tutor.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tutor.name}</CardTitle>
                          <CardDescription className="text-sm text-primary font-medium">
                            {tutor.subject}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteTutor(tutor.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Personality</p>
                      <Badge variant="outline" className="text-xs">
                        {tutor.personality}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tutor.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {tutor.chatCount} chats
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(tutor.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Link to={`/chat/${tutor.id}`}>
                        <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Chat
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}