'use client'

import { useRouter } from 'next/navigation'
import { Settings, Trash2, Download, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useHistory } from '@/hooks/useHistory'
import { useToast } from '@/hooks/use-toast'

export default function SettingsView() {
  const router = useRouter()
  const { history, settings, updateSettings, clearHistory, exportHistory } = useHistory()
  const { toast } = useToast()

  const handleToggleHistory = (enabled: boolean) => {
    updateSettings({ enabled })
    toast({
      title: enabled ? 'History enabled' : 'History disabled',
      description: enabled 
        ? 'Your study sessions will now be saved' 
        : 'Your study sessions will no longer be saved',
    })
  }

  const handleMaxEntriesChange = (value: string) => {
    const num = parseInt(value)
    if (!isNaN(num) && num > 0 && num <= 1000) {
      updateSettings({ maxEntries: num })
    }
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to delete all history? This action cannot be undone.')) {
      clearHistory()
      toast({
        title: 'History cleared',
        description: 'All study session history has been deleted',
      })
    }
  }

  const handleExportHistory = () => {
    exportHistory()
    toast({
      title: 'History exported',
      description: 'Your history has been downloaded as JSON',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your study session preferences</p>
        </div>
      </div>

      {/* History Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            History Settings
          </CardTitle>
          <CardDescription>
            Configure how your study sessions are saved
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable History */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-history">Enable History</Label>
              <p className="text-sm text-muted-foreground">
                Save your study sessions locally on this device
              </p>
            </div>
            <Button
              variant={settings.enabled ? 'default' : 'outline'}
              onClick={() => handleToggleHistory(!settings.enabled)}
            >
              {settings.enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {/* Max Entries */}
          <div className="space-y-2">
            <Label htmlFor="max-entries">Maximum History Entries</Label>
            <div className="flex items-center gap-2">
              <Input
                id="max-entries"
                type="number"
                min="1"
                max="1000"
                value={settings.maxEntries}
                onChange={(e) => handleMaxEntriesChange(e.target.value)}
                className="max-w-[200px]"
              />
              <span className="text-sm text-muted-foreground">
                sessions
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Older sessions will be automatically removed when this limit is reached
            </p>
          </div>

          {/* Current Stats */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{history.length}</div>
                <div className="text-sm text-muted-foreground">Saved Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {((JSON.stringify(history).length / 1024) / 1024).toFixed(2)} MB
                </div>
                <div className="text-sm text-muted-foreground">Storage Used</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export or delete your saved history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={handleExportHistory}
              disabled={history.length === 0}
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Export History
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearHistory}
              disabled={history.length === 0}
              className="flex-1 gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All History
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            💡 Your data is stored locally on your device and never sent to any server
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

