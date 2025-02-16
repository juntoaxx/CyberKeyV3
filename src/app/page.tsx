import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { redirect } from "next/navigation"

export default function Home() {
  const { user, loading } = useAuth()

  if (!loading && user) {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">
          Welcome to CyberKey V3
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Advanced API Key Management System
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">
              Get Started
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  )
}
