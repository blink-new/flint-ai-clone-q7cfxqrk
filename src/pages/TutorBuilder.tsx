import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, ArrowRight, ArrowLeft, Sparkles, BookOpen, User, MessageSquare } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { blink } from '../blink/client'
import { useToast } from '../hooks/use-toast'

const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature', 
  'History', 'Geography', 'Computer Science', 'Psychology', 'Philosophy',
  'Economics', 'Art', 'Music', 'Foreign Languages', 'Engineering'
]

const personalities = [
  { name: 'Patient & Encouraging', description: 'Supportive and understanding, perfect for beginners' },
  { name: 'Enthusiastic & Energetic', description: 'Motivating and inspiring, great for engagement' },
  { name: 'Methodical & Structured', description: 'Organized and systematic, ideal for complex topics' },
  { name: 'Creative & Innovative', description: 'Imaginative and original, excellent for creative subjects' },
  { name: 'Analytical & Logical', description: 'Rational and precise, perfect for STEM subjects' },
  { name: 'Friendly & Conversational', description: 'Casual and approachable, great for discussions' }
]

const teachingStyles = [
  'Socratic Method', 'Visual Learning', 'Hands-on Practice', 'Storytelling',
  'Problem-Based Learning', 'Interactive Discussions', 'Step-by-Step Guidance'
]

export default function TutorBuilder() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  
  const [tutorData, setTutorData] = useState({
    name: '',
    subject: '',
    personality: '',
    teachingStyle: '',
    description: '',
    expertise: '',
    gradeLevel: ''
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const user = await blink.auth.me()
      
      const newTutor = await blink.db.tutors.create({
        id: `tutor_${Date.now()}`,
        userId: user.id,
        name: tutorData.name,
        subject: tutorData.subject,
        personality: tutorData.personality,
        teachingStyle: tutorData.teachingStyle,
        description: tutorData.description,
        expertise: tutorData.expertise,
        gradeLevel: tutorData.gradeLevel,
        createdAt: new Date().toISOString(),
        chatCount: 0,
        isActive: true
      })

      toast({
        title: "Tutor Created Successfully!",
        description: `${tutorData.name} is ready to help students learn ${tutorData.subject}.`,
      })

      navigate(`/chat/${newTutor.id}`)
    } catch (error) {
      console.error('Failed to create tutor:', error)
      toast({
        title: "Error",
        description: "Failed to create tutor. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return tutorData.name && tutorData.subject
      case 2:
        return tutorData.personality && tutorData.teachingStyle
      case 3:
        return tutorData.description && tutorData.expertise
      case 4:
        return tutorData.gradeLevel
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Your AI Tutor</h1>
          <p className="text-muted-foreground">
            Build a personalized AI tutor with unique personality and teaching style
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <User className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h2 className="text-2xl font-semibold mb-2">Basic Information</h2>
                  <p className="text-muted-foreground">Let's start with the basics about your tutor</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tutor Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Professor Smith, Dr. Johnson"
                      value={tutorData.name}
                      onChange={(e) => setTutorData({ ...tutorData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={tutorData.subject} onValueChange={(value) => setTutorData({ ...tutorData, subject: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h2 className="text-2xl font-semibold mb-2">Personality & Style</h2>
                  <p className="text-muted-foreground">Define how your tutor interacts with students</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Personality Type</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {personalities.map((personality) => (
                        <Card
                          key={personality.name}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            tutorData.personality === personality.name
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setTutorData({ ...tutorData, personality: personality.name })}
                        >
                          <CardContent className="p-4">
                            <h3 className="font-medium mb-1">{personality.name}</h3>
                            <p className="text-sm text-muted-foreground">{personality.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Teaching Style</Label>
                    <div className="flex flex-wrap gap-2">
                      {teachingStyles.map((style) => (
                        <Badge
                          key={style}
                          variant={tutorData.teachingStyle === style ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => setTutorData({ ...tutorData, teachingStyle: style })}
                        >
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <BookOpen className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h2 className="text-2xl font-semibold mb-2">Expertise & Description</h2>
                  <p className="text-muted-foreground">Tell us more about your tutor's knowledge and approach</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">Tutor Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your tutor's background, teaching philosophy, and what makes them special..."
                      value={tutorData.description}
                      onChange={(e) => setTutorData({ ...tutorData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expertise">Areas of Expertise</Label>
                    <Textarea
                      id="expertise"
                      placeholder="List specific topics, skills, or areas where this tutor excels..."
                      value={tutorData.expertise}
                      onChange={(e) => setTutorData({ ...tutorData, expertise: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <MessageSquare className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h2 className="text-2xl font-semibold mb-2">Final Details</h2>
                  <p className="text-muted-foreground">Complete your tutor's profile</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel">Target Grade Level</Label>
                    <Select value={tutorData.gradeLevel} onValueChange={(value) => setTutorData({ ...tutorData, gradeLevel: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elementary">Elementary (K-5)</SelectItem>
                        <SelectItem value="middle">Middle School (6-8)</SelectItem>
                        <SelectItem value="high">High School (9-12)</SelectItem>
                        <SelectItem value="college">College/University</SelectItem>
                        <SelectItem value="adult">Adult Learning</SelectItem>
                        <SelectItem value="all">All Levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preview */}
                  <Card className="bg-muted/30">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg">{tutorData.name || 'Your Tutor'}</h3>
                          <p className="text-sm text-primary font-medium">{tutorData.subject}</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{tutorData.personality}</Badge>
                          <Badge variant="outline">{tutorData.teachingStyle}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tutorData.description || 'No description provided'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-primary hover:bg-primary/90"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={!isStepValid() || isCreating}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Tutor
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}