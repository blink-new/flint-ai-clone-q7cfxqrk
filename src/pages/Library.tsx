import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Brain, MessageSquare, Star, Users, Search, Filter, BookOpen, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { blink } from '../blink/client'

interface PublicTutor {
  id: string
  name: string
  subject: string
  personality: string
  description: string
  rating: number
  studentCount: number
  createdBy: string
  isPublic: boolean
}

const featuredTutors = [
  {
    id: 'featured_1',
    name: 'Professor Mathematics',
    subject: 'Mathematics',
    personality: 'Patient & Methodical',
    description: 'Expert in calculus, algebra, and advanced mathematical concepts. Specializes in breaking down complex problems into manageable steps.',
    rating: 4.9,
    studentCount: 1247,
    createdBy: 'Flint AI Team',
    isPublic: true
  },
  {
    id: 'featured_2',
    name: 'Dr. Science Explorer',
    subject: 'Physics',
    personality: 'Enthusiastic & Curious',
    description: 'Passionate about making physics accessible and exciting. Uses real-world examples and interactive demonstrations.',
    rating: 4.8,
    studentCount: 892,
    createdBy: 'Flint AI Team',
    isPublic: true
  },
  {
    id: 'featured_3',
    name: 'Ms. Creative Writer',
    subject: 'English Literature',
    personality: 'Creative & Inspiring',
    description: 'Helps students discover the beauty of literature and develop their writing skills through creative exercises.',
    rating: 4.9,
    studentCount: 1156,
    createdBy: 'Flint AI Team',
    isPublic: true
  },
  {
    id: 'featured_4',
    name: 'Code Master',
    subject: 'Computer Science',
    personality: 'Analytical & Logical',
    description: 'Expert programmer who teaches coding concepts from basics to advanced algorithms with practical projects.',
    rating: 4.7,
    studentCount: 2103,
    createdBy: 'Flint AI Team',
    isPublic: true
  },
  {
    id: 'featured_5',
    name: 'History Storyteller',
    subject: 'History',
    personality: 'Engaging & Narrative',
    description: 'Brings history to life through compelling stories and helps students understand historical contexts.',
    rating: 4.8,
    studentCount: 756,
    createdBy: 'Flint AI Team',
    isPublic: true
  },
  {
    id: 'featured_6',
    name: 'Language Coach',
    subject: 'Foreign Languages',
    personality: 'Encouraging & Interactive',
    description: 'Multilingual tutor specializing in conversational practice and cultural immersion techniques.',
    rating: 4.9,
    studentCount: 1834,
    createdBy: 'Flint AI Team',
    isPublic: true
  }
]

const subjects = [
  'All Subjects', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 
  'English Literature', 'History', 'Geography', 'Computer Science', 
  'Psychology', 'Philosophy', 'Economics', 'Art', 'Music', 'Foreign Languages'
]

export default function Library() {
  const [tutors, setTutors] = useState<PublicTutor[]>(featuredTutors)
  const [filteredTutors, setFilteredTutors] = useState<PublicTutor[]>(featuredTutors)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('All Subjects')
  const [sortBy, setSortBy] = useState('rating')

  const filterAndSortTutors = useCallback(() => {
    let filtered = tutors

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(tutor =>
        tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by subject
    if (selectedSubject !== 'All Subjects') {
      filtered = filtered.filter(tutor => tutor.subject === selectedSubject)
    }

    // Sort tutors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'students':
          return b.studentCount - a.studentCount
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredTutors(filtered)
  }, [searchQuery, selectedSubject, sortBy, tutors])

  useEffect(() => {
    filterAndSortTutors()
  }, [filterAndSortTutors])

  const startChatWithTutor = async (tutor: PublicTutor) => {
    try {
      const user = await blink.auth.me()
      
      // Create a copy of the tutor for the user
      const userTutor = await blink.db.tutors.create({
        id: `tutor_${Date.now()}_${tutor.id}`,
        userId: user.id,
        name: tutor.name,
        subject: tutor.subject,
        personality: tutor.personality,
        description: tutor.description,
        expertise: `Based on ${tutor.name} from the Flint AI Library`,
        teachingStyle: 'Interactive Discussions',
        gradeLevel: 'all',
        createdAt: new Date().toISOString(),
        chatCount: 0,
        isActive: true
      })

      // Navigate to chat
      window.location.href = `/chat/${userTutor.id}`
    } catch (error) {
      console.error('Failed to start chat:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Tutor Library</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing AI tutors created by our community. Find the perfect learning companion for any subject.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-muted/30 rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tutors by name, subject, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="students">Most Popular</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{tutors.length}</div>
              <div className="text-sm text-muted-foreground">AI Tutors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {tutors.reduce((sum, t) => sum + t.studentCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Students Helped</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {(tutors.reduce((sum, t) => sum + t.rating, 0) / tutors.length).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              {filteredTutors.length === tutors.length ? 'All Tutors' : 'Search Results'}
            </h2>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredTutors.length} {filteredTutors.length === 1 ? 'Tutor' : 'Tutors'}
            </Badge>
          </div>

          {filteredTutors.length === 0 ? (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No tutors found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or browse all available tutors.
              </p>
              <Button onClick={() => {
                setSearchQuery('')
                setSelectedSubject('All Subjects')
              }}>
                Clear Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutors.map((tutor) => (
                <Card key={tutor.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {tutor.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-primary font-medium">
                            {tutor.subject}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{tutor.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Badge variant="outline" className="text-xs mb-2">
                        {tutor.personality}
                      </Badge>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {tutor.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {tutor.studentCount.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {tutor.createdBy}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => startChatWithTutor(tutor)}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Start Learning
                      </Button>
                      <Button size="sm" variant="outline">
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8">
              <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Create Your Own AI Tutor
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Have a unique teaching style or specialized knowledge? Create your own AI tutor and share it with the community.
              </p>
              <Link to="/create">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Tutor
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}