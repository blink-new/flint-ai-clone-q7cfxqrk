import { Link } from 'react-router-dom'
import { Brain, Sparkles, Users, BookOpen, ArrowRight, Play, Star, Plus, MessageSquare, Library } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

export default function HomePage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Tutors',
      description: 'Create intelligent tutors with unique personalities and teaching styles tailored to any subject.'
    },
    {
      icon: Sparkles,
      title: 'Personalized Learning',
      description: 'Adaptive AI that learns from student interactions to provide customized educational experiences.'
    },
    {
      icon: Users,
      title: 'Multi-Subject Support',
      description: 'From mathematics to literature, create specialized tutors for any academic discipline.'
    },
    {
      icon: BookOpen,
      title: 'Interactive Conversations',
      description: 'Engage in natural, educational conversations that make learning enjoyable and effective.'
    }
  ]

  const tutorExamples = [
    {
      name: 'Professor Mathematics',
      subject: 'Calculus & Algebra',
      personality: 'Patient & Methodical',
      rating: 4.9,
      students: 1247
    },
    {
      name: 'Dr. Science',
      subject: 'Physics & Chemistry',
      personality: 'Enthusiastic & Curious',
      rating: 4.8,
      students: 892
    },
    {
      name: 'Ms. Literature',
      subject: 'English & Writing',
      personality: 'Creative & Inspiring',
      rating: 4.9,
      students: 1156
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Powered by Advanced AI
              </Badge>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Create Your Perfect
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  AI Tutor
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Build intelligent, personalized tutors that adapt to any learning style. 
                Transform education with AI-powered conversations that make learning engaging and effective.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/create">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your Tutor
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-semibold rounded-xl border-2 hover:bg-accent/10">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Tutors Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">50K+</div>
                <div className="text-sm text-muted-foreground">Students Helped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">4.9★</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Why Choose Flint AI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of personalized education with our advanced AI tutoring platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Example Tutors Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Meet Our AI Tutors
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the diverse personalities and expertise of our AI tutoring community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tutorExamples.map((tutor, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{tutor.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{tutor.name}</CardTitle>
                  <CardDescription className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">{tutor.subject}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{tutor.personality}</div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {tutor.students.toLocaleString()} students
                    </span>
                    <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to Transform Learning?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of educators and students who are already experiencing the future of personalized education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create">
                <Button size="lg" variant="secondary" className="px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="w-5 h-5 mr-2" />
                  Start Creating
                </Button>
              </Link>
              <Link to="/library">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold rounded-xl border-2 border-white text-white hover:bg-white hover:text-primary">
                  <Library className="w-5 h-5 mr-2" />
                  Browse Library
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}