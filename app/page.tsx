import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import Button from '../components/ui/button'

export const metadata: Metadata = {
    title: 'Design • Colors',
}

const swatches = [
    { name: 'Primary', className: 'bg-primary', hex: '#3b82f6' },
    { name: 'Secondary', className: 'bg-secondary', hex: '#f59e0b' },
    { name: 'Accent', className: 'bg-accent', hex: '#ec4899' },
    { name: 'Success', className: 'bg-success', hex: '#22c55e' },
    { name: 'Background', className: 'bg-background', hex: '#0a0a0a', ring: true },
]

export default function ColorsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Color Palette</h1>
                <p className="text-muted-foreground">Design tokens preview</p>
            </div>

            <Card>
                <CardContent className="grid gap-6 pt-6 md:grid-cols-5">
                    {swatches.map((s) => (
                        <div key={s.name} className="flex flex-col items-center gap-3">
                            <div
                                className={`${s.className} h-20 w-full rounded-md ${s.ring ? 'ring-1 ring-border' : ''}`}
                            />
                            <span className="text-sm text-muted-foreground">{s.name}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Hex Values</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                        {swatches.map((s) => (
                            <div key={s.name} className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                                <span className="text-sm text-muted-foreground">{s.name}:</span>
                                <code className="font-mono text-sm">{s.hex}</code>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Component Samples</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="accent">Accent</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="ghost">Ghost</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Typography (Space Grotesk)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <h1 className="text-4xl font-bold">Heading 1</h1>
                    <h2 className="text-3xl font-semibold">Heading 2</h2>
                    <h3 className="text-2xl font-medium">Heading 3</h3>
                    <p>
                        Body text — The quick brown fox jumps over the lazy dog. 0123456789
                    </p>
                    <p className="text-muted-foreground">
                        Muted text — The quick brown fox jumps over the lazy dog.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}


