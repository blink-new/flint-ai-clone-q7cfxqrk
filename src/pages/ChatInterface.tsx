import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Send, Brain, User, ArrowLeft, MoreVertical, Copy, RefreshCw, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import { ScrollArea } from '../components/ui/scroll-area'
import { blink } from '../blink/client'
import { useToast } from '../hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  attachments?: {
    type: 'image' | 'document'
    url: string
    name: string
    extractedText?: string
  }[]
  generatedImages?: {
    url: string
    description: string
  }[]
}

interface Tutor {
  id: string
  name: string
  subject: string
  personality: string
  teachingStyle: string
  description: string
  expertise: string
}

export default function ChatInterface() {
  const { tutorId } = useParams()
  const { toast } = useToast()
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [attachments, setAttachments] = useState<{type: 'image' | 'document', url: string, name: string, extractedText?: string}[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadTutor = async (id: string) => {
    try {
      const tutorData = await blink.db.tutors.list({
        where: { id }
      })
      if (tutorData.length > 0) {
        setTutor(tutorData[0])
      }
    } catch (error) {
      console.error('Failed to load tutor:', error)
    }
  }

  const loadMessages = async (id: string) => {
    setIsLoading(true)
    try {
      const chatMessages = await blink.db.messages.list({
        where: { tutorId: id },
        orderBy: { timestamp: 'asc' }
      })
      
      // Parse attachments and generated images from JSON string
      const messagesWithAttachments = chatMessages.map(msg => ({
        ...msg,
        attachments: msg.attachments ? JSON.parse(msg.attachments) : undefined,
        generatedImages: msg.generatedImages ? JSON.parse(msg.generatedImages) : undefined
      }))
      
      setMessages(messagesWithAttachments)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (tutorId) {
      loadTutor(tutorId)
      loadMessages(tutorId)
    }
  }, [tutorId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    setIsUploading(true)
    const newAttachments: typeof attachments = []

    try {
      for (const file of Array.from(files)) {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
            variant: "destructive"
          })
          continue
        }

        // Check file type
        const isImage = file.type.startsWith('image/')
        const isDocument = file.type === 'application/pdf' || 
                          file.type.includes('document') || 
                          file.type.includes('text') ||
                          file.name.toLowerCase().endsWith('.txt') ||
                          file.name.toLowerCase().endsWith('.doc') ||
                          file.name.toLowerCase().endsWith('.docx')

        if (!isImage && !isDocument) {
          toast({
            title: "Unsupported file type",
            description: `${file.name} is not supported. Please upload images or documents.`,
            variant: "destructive"
          })
          continue
        }

        // Upload file to storage
        const { publicUrl } = await blink.storage.upload(
          file,
          `homework/${Date.now()}-${file.name}`,
          { upsert: true }
        )

        let extractedText = ''
        
        // Extract text from documents
        if (isDocument) {
          try {
            extractedText = await blink.data.extractFromUrl(publicUrl)
          } catch (error) {
            console.error('Failed to extract text:', error)
          }
        }

        newAttachments.push({
          type: isImage ? 'image' : 'document',
          url: publicUrl,
          name: file.name,
          extractedText
        })
      }

      setAttachments(prev => [...prev, ...newAttachments])
      
      if (newAttachments.length > 0) {
        toast({
          title: "Files uploaded",
          description: `${newAttachments.length} file(s) uploaded successfully.`
        })
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const shouldGenerateVisualAid = (message: string): boolean => {
    const visualKeywords = [
      'division', 'multiply', 'fraction', 'geometry', 'shape', 'triangle', 'circle', 'square',
      'graph', 'chart', 'diagram', 'visual', 'picture', 'show me', 'draw', 'illustrate',
      'example', 'demonstrate', 'explain with', 'how does', 'what does', 'looks like'
    ]
    
    return visualKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    )
  }

  const generateEducationalImage = async (concept: string, subject: string): Promise<string | null> => {
    try {
      const { data } = await blink.ai.generateImage({
        prompt: `Educational illustration for ${subject}: ${concept}. Simple, clear, colorful diagram suitable for learning. Clean white background, easy to understand visual representation.`,
        size: '1024x1024',
        quality: 'high',
        style: 'natural'
      })
      
      return data[0]?.url || null
    } catch (error) {
      console.error('Failed to generate educational image:', error)
      return null
    }
  }

  const sendMessage = async () => {
    if ((!inputMessage.trim() && attachments.length === 0) || !tutor || isGenerating) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setAttachments([])
    setIsGenerating(true)

    try {
      // Save user message
      await blink.db.messages.create({
        id: userMessage.id,
        tutorId,
        role: userMessage.role,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
        attachments: userMessage.attachments ? JSON.stringify(userMessage.attachments) : null
      })

      // Save attachments to separate table for better querying
      if (userMessage.attachments) {
        for (const attachment of userMessage.attachments) {
          await blink.db.messageAttachments.create({
            id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            messageId: userMessage.id,
            type: attachment.type,
            url: attachment.url,
            name: attachment.name,
            extractedText: attachment.extractedText || null
          })
        }
      }

      // Generate AI response
      const systemPrompt = `You are ${tutor.name}, an AI tutor specializing in ${tutor.subject}. 
Your personality is ${tutor.personality} and you use a ${tutor.teachingStyle} teaching approach.

Background: ${tutor.description}
Expertise: ${tutor.expertise}

IMPORTANT: Enhance your responses with visual learning elements:
🎯 Use relevant emojis throughout your explanations (🍎📚✨🎯💡🔢🌟⭐🎉👏🤔💭🔍📊📈)
🎨 For math problems, describe visual representations and analogies
📝 Break down complex concepts into clear, visual steps
🎪 Use formatting like bullet points, numbered lists, and spacing for clarity
🖼️ When explaining mathematical concepts, describe visual analogies (like apple division, pizza fractions, etc.)
🌈 Be encouraging and use positive emojis to motivate learning
📐 For geometry, describe shapes and spatial relationships clearly
🧮 For arithmetic, suggest counting objects or visual groupings
🎭 Make learning fun and engaging with creative explanations

When students share homework images or documents, analyze them carefully and provide specific help with the problems shown. Reference specific parts of their work when giving feedback.

Always stay in character and provide helpful, educational responses that match your personality and teaching style. 
Be encouraging, patient, and adapt your explanations to the student's level of understanding.`

      // Prepare message content with attachments
      let messageContent = userMessage.content
      const messageImages: string[] = []

      if (userMessage.attachments) {
        for (const attachment of userMessage.attachments) {
          if (attachment.type === 'image') {
            messageImages.push(attachment.url)
            messageContent += `\n\n[Student uploaded an image: ${attachment.name}]`
          } else if (attachment.type === 'document' && attachment.extractedText) {
            messageContent += `\n\n[Student uploaded a document: ${attachment.name}]\nDocument content:\n${attachment.extractedText}`
          }
        }
      }

      let assistantResponse = ''
      
      // Create message with images if present
      const userMessageForAI = messageImages.length > 0 
        ? {
            role: 'user' as const,
            content: [
              { type: 'text' as const, text: messageContent },
              ...messageImages.map(url => ({ type: 'image' as const, image: url }))
            ]
          }
        : { role: 'user' as const, content: messageContent }
      
      await blink.ai.streamText(
        {
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-10).map(m => ({ 
              role: m.role, 
              content: m.content + (m.attachments ? 
                m.attachments.map(att => 
                  att.type === 'document' && att.extractedText ? 
                    `\n[Document: ${att.name}]\n${att.extractedText}` : 
                    `\n[${att.type}: ${att.name}]`
                ).join('') : '')
            })),
            userMessageForAI
          ],
          model: 'gpt-4o-mini',
          maxTokens: 800
        },
        (chunk) => {
          assistantResponse += chunk
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            
            if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id.startsWith('temp_')) {
              lastMessage.content = assistantResponse
            } else {
              newMessages.push({
                id: 'temp_response',
                role: 'assistant',
                content: assistantResponse,
                timestamp: new Date().toISOString()
              })
            }
            return newMessages
          })
        }
      )

      // Generate educational image if helpful
      const generatedImages: { url: string; description: string }[] = []
      
      if (shouldGenerateVisualAid(userMessage.content)) {
        try {
          const imageUrl = await generateEducationalImage(userMessage.content, tutor.subject)
          if (imageUrl) {
            generatedImages.push({
              url: imageUrl,
              description: `Visual explanation for: ${userMessage.content.slice(0, 50)}...`
            })
          }
        } catch (error) {
          console.error('Failed to generate visual aid:', error)
        }
      }

      // Save final assistant message
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toISOString(),
        generatedImages: generatedImages.length > 0 ? generatedImages : undefined
      }

      await blink.db.messages.create({
        id: assistantMessage.id,
        tutorId,
        role: assistantMessage.role,
        content: assistantMessage.content,
        timestamp: assistantMessage.timestamp,
        generatedImages: assistantMessage.generatedImages ? JSON.stringify(assistantMessage.generatedImages) : null
      })

      // Update messages with final version
      setMessages(prev => {
        const newMessages = prev.filter(m => !m.id.startsWith('temp_'))
        return [...newMessages, assistantMessage]
      })

      // Update chat count
      await blink.db.tutors.update(tutorId!, { 
        chatCount: (tutor as any).chatCount + 1 
      })

    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied!",
      description: "Message copied to clipboard.",
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Brain className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <h2 className="text-2xl font-semibold">Loading tutor...</h2>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-background flex flex-col relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background border-2 border-dashed border-primary rounded-2xl p-8 text-center">
            <Paperclip className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drop your homework files here</h3>
            <p className="text-muted-foreground">Images and documents (PDF, DOC, TXT) up to 10MB each</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">{tutor.name}</h1>
                  <p className="text-sm text-muted-foreground">{tutor.subject} Tutor</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{tutor.personality}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setMessages([])}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <ScrollArea className="h-full py-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-muted-foreground">Loading conversation...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Card className="max-w-md text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle>Start Learning with {tutor.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {tutor.description}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="outline">{tutor.teachingStyle}</Badge>
                      <Badge variant="outline">{tutor.subject}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className={message.role === 'user' ? 'bg-muted' : 'bg-primary text-primary-foreground'}>
                          {message.role === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`group relative ${message.role === 'user' ? 'text-right' : ''}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mb-3 space-y-2">
                              {message.attachments.map((attachment, idx) => (
                                <div key={idx} className="flex items-center space-x-2 p-2 rounded-lg bg-black/10">
                                  {attachment.type === 'image' ? (
                                    <>
                                      <ImageIcon className="w-4 h-4 flex-shrink-0" />
                                      <img 
                                        src={attachment.url} 
                                        alt={attachment.name}
                                        className="max-w-xs max-h-48 rounded-lg object-cover"
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="w-4 h-4 flex-shrink-0" />
                                      <span className="text-xs truncate">{attachment.name}</span>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {message.content && (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          )}
                          
                          {/* Generated Images */}
                          {message.generatedImages && message.generatedImages.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.generatedImages.map((genImage, idx) => (
                                <div key={idx} className="border rounded-lg overflow-hidden bg-white/50">
                                  <img 
                                    src={genImage.url} 
                                    alt={genImage.description}
                                    className="w-full max-w-sm rounded-lg object-cover"
                                  />
                                  <div className="p-2 text-xs text-muted-foreground bg-white/80">
                                    🎨 {genImage.description}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="flex space-x-3 max-w-3xl">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Brain className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="flex items-center space-x-2 bg-muted rounded-lg p-2 pr-1">
                  {attachment.type === 'image' ? (
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm truncate max-w-32">{attachment.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Input
                placeholder={`Ask ${tutor.name} anything about ${tutor.subject}... or upload homework images/documents`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isGenerating}
                className="min-h-[44px] pr-12"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isGenerating}
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Paperclip className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Button
              onClick={sendMessage}
              disabled={(!inputMessage.trim() && attachments.length === 0) || isGenerating}
              className="bg-primary hover:bg-primary/90 px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
          
          <p className="text-xs text-muted-foreground mt-2">
            Upload homework images or documents (PDF, DOC, TXT) up to 10MB each
          </p>
        </div>
      </div>
    </div>
  )
}