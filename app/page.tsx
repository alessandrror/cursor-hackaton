import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, Brain, Target, Zap, Shield, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Cerebryx • Think Deeper, Remember Longer',
  description: 'Transform your reading into lasting understanding with AI-powered study sessions and quizzes.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fadeIn">
            <Zap className="h-4 w-4" />
            <span>AI-Powered Study Companion</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Think Deeper, Remember Longer
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            Transform your reading into lasting understanding with AI-powered study sessions and comprehensive quizzes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <Link href="/study">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                Start Studying
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Master Any Material
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you learn more effectively
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Smart Reading Timer</CardTitle>
              <CardDescription className="text-base">
                Get optimal reading time estimates based on content length. Focus on reading, not timing.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">AI-Powered Quizzes</CardTitle>
              <CardDescription className="text-base">
                Generate comprehensive quizzes from your content. Test understanding with multiple question types.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl">Track Your Progress</CardTitle>
              <CardDescription className="text-base">
                Set reading goals and track your progress over time. Build consistent study habits.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Save for Later</CardTitle>
              <CardDescription className="text-base">
                Organize your reading materials with tags and search. Never lose track of what you want to read.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-xl">Works Everywhere</CardTitle>
              <CardDescription className="text-base">
                Upload PDFs or paste text. Works with any content format. Start studying in seconds.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl">Privacy First</CardTitle>
              <CardDescription className="text-base">
                Use anonymously or create an account. Your data stays secure and private.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="max-w-4xl mx-auto border-2 bg-gradient-to-br from-card to-card/50">
          <CardContent className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Reading?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start your first study session now. No registration required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/study">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Start in seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>100% free</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
