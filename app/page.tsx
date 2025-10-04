import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'

export default function HomePage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">
          Study Timer & Quiz
        </CardTitle>
        <CardDescription className="text-center">
          Project configuration complete - ready for implementation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Configuration phase completed. Ready to build the application
            features.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
