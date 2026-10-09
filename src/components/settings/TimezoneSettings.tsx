import { useTimezone, COMMON_TIMEZONES, DATE_FORMATS, TIME_FORMATS } from '@/contexts/TimezoneContext'
import { formatDateForUser } from '@/lib/timezone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Globe, RotateCcw, CheckCircle, XCircle, Loader2, MapPin, Settings } from 'lucide-react'
import { getTimezoneOffset, getTimezoneAbbreviation } from '@/lib/timezone'
import { toast } from 'sonner'

export function TimezoneSettings() {
  const {
    preferences,
    updatePreferences,
    resetToDefaults,
    formatDate,
    formatDateOnly,
    formatTimeOnly,
    isLoading,
    syncStatus,
    lastSyncError,
    isTimezoneManuallySet,
    getTimezoneSource,
    forceAutoDetectTimezone
  } = useTimezone()

  const currentDate = new Date()
  const previewTimestamp = currentDate.toISOString()

  const handleTimezoneChange = (timezone: string) => {
    updatePreferences({ timezone })
    toast.success(`Timezone updated to ${COMMON_TIMEZONES[timezone as keyof typeof COMMON_TIMEZONES] || timezone}`)
  }

  const handleDateFormatChange = (dateFormat: string) => {
    updatePreferences({ dateFormat })
    toast.success('Date format updated')
  }

  const handleTimeFormatChange = (timeFormat: '12h' | '24h') => {
    updatePreferences({ timeFormat })
    toast.success('Time format updated')
  }

  const handleRelativeDatesChange = (showRelativeDates: boolean) => {
    updatePreferences({ showRelativeDates })
    toast.success(`Relative dates ${showRelativeDates ? 'enabled' : 'disabled'}`)
  }

  const handleTimezoneDisplayChange = (showTimezone: boolean) => {
    updatePreferences({ showTimezone })
    toast.success(`Timezone display ${showTimezone ? 'enabled' : 'disabled'}`)
  }

  const handleResetToDefaults = () => {
    resetToDefaults()
    toast.success('Timezone settings reset to defaults')
  }

  const handleAutoDetectTimezone = () => {
    forceAutoDetectTimezone()
    toast.success('Timezone auto-detected and updated')
  }

  const getTimezoneSourceBadge = () => {
    const source = getTimezoneSource()
    switch (source) {
      case 'manually-set':
        return (
          <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
            <Settings className="w-3 h-3 mr-1" />
            Manual
          </Badge>
        )
      case 'auto-detected':
        return (
          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
            <MapPin className="w-3 h-3 mr-1" />
            Auto-detected
          </Badge>
        )
      case 'backend-synced':
        return (
          <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Synced
          </Badge>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timezone & Date Settings
          </CardTitle>
          <CardDescription>Loading timezone preferences...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timezone & Date Settings
            </CardTitle>
            <CardDescription>
              Configure how dates and times are displayed throughout the application
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {syncStatus === 'loading' && (
              <Badge variant="outline" className="text-xs">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Syncing...
              </Badge>
            )}
            {syncStatus === 'synced' && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Synced
              </Badge>
            )}
            {syncStatus === 'error' && (
              <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                <XCircle className="w-3 h-3 mr-1" />
                Sync Error
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Settings Summary */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <Label className="font-medium">Current Settings Preview</Label>
            <Badge variant="outline" className="text-xs">
              {getTimezoneAbbreviation(preferences.timezone, currentDate)}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Full Date & Time:</span>
              <div className="font-mono">{formatDate(previewTimestamp, { includeTime: true, includeTimezone: preferences.showTimezone })}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Date Only:</span>
              <div className="font-mono">{formatDateOnly(previewTimestamp)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Time Only:</span>
              <div className="font-mono">{formatDateForUser(previewTimestamp, preferences.timezone, { 
                dateFormat: '',
                timeFormat: TIME_FORMATS[preferences.timeFormat],
                includeTime: true,
                includeTimezone: preferences.showTimezone
              }).replace(/^,\s*/, '')}</div>
            </div>
            <div>
              <span className="text-muted-foreground">UTC Offset:</span>
              <div className="font-mono">{getTimezoneOffset(preferences.timezone, currentDate)}</div>
            </div>
          </div>
        </div>

        {/* Timezone Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <Label htmlFor="timezone">Timezone</Label>
            </div>
            <div className="flex items-center gap-2">
              {getTimezoneSourceBadge()}
              {getTimezoneSource() === 'manually-set' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAutoDetectTimezone}
                  className="text-xs h-7 px-2"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  Auto-detect
                </Button>
              )}
            </div>
          </div>
          <Select value={preferences.timezone} onValueChange={handleTimezoneChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select your timezone" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <div className="px-2 py-1">
                <div className="text-xs font-medium text-muted-foreground mb-2">USA & Canada</div>
                {Object.entries(COMMON_TIMEZONES)
                  .filter(([tz]) => tz.startsWith('America/') || tz.startsWith('Pacific/'))
                  .map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
              </div>
              <Separator className="my-2" />
              <div className="px-2 py-1">
                <div className="text-xs font-medium text-muted-foreground mb-2">Asia & India</div>
                {Object.entries(COMMON_TIMEZONES)
                  .filter(([tz]) => tz.startsWith('Asia/'))
                  .map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
              </div>
              <Separator className="my-2" />
              <div className="px-2 py-1">
                <div className="text-xs font-medium text-muted-foreground mb-2">Europe & Others</div>
                {Object.entries(COMMON_TIMEZONES)
                  .filter(([tz]) => tz.startsWith('Europe/') || tz.startsWith('Australia/'))
                  .map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
              </div>
              <Separator className="my-2" />
              <div className="px-2 py-1">
                <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
              </div>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Date Format Selection */}
        <div className="space-y-3">
          <Label htmlFor="dateFormat">Date Format</Label>
          <Select value={preferences.dateFormat} onValueChange={handleDateFormatChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DATE_FORMATS).map(([key, format]) => (
                <SelectItem key={key} value={format}>
                  <div className="flex justify-between items-center w-full">
                    <span>{key}</span>
                    <span className="font-mono text-sm text-muted-foreground ml-4">
                      {formatDateOnly(previewTimestamp)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Time Format Selection */}
        <div className="space-y-3">
          <Label htmlFor="timeFormat">Time Format</Label>
          <Select value={preferences.timeFormat} onValueChange={handleTimeFormatChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">
                <div className="flex justify-between items-center w-full">
                  <span>12-hour (AM/PM)</span>
                  <span className="font-mono text-sm text-muted-foreground ml-4">
                    {formatTimeOnly(previewTimestamp)}
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="24h">
                <div className="flex justify-between items-center w-full">
                  <span>24-hour</span>
                  <span className="font-mono text-sm text-muted-foreground ml-4">
                    {currentDate.toLocaleTimeString('en-US', { 
                      hour12: false, 
                      timeZone: preferences.timezone,
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Display Options */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Display Options</Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="relativeDates">Relative Dates</Label>
              <p className="text-sm text-muted-foreground">
                Show "2 hours ago" instead of absolute timestamps when recent
              </p>
            </div>
            <Switch
              id="relativeDates"
              checked={preferences.showRelativeDates}
              onCheckedChange={handleRelativeDatesChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="showTimezone">Show Timezone</Label>
              <p className="text-sm text-muted-foreground">
                Display timezone abbreviation (EST, PST, IST, etc.) with times
              </p>
            </div>
            <Switch
              id="showTimezone"
              checked={preferences.showTimezone}
              onCheckedChange={handleTimezoneDisplayChange}
            />
          </div>
        </div>

        <Separator />

        {/* Reset to Defaults */}
        <div className="flex justify-between items-center pt-2">
          <div>
            <Label className="text-base font-medium">Reset Settings</Label>
            <p className="text-sm text-muted-foreground">
              Restore all timezone settings to their defaults
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Global Application Note */}
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> These settings apply globally to all dates and times displayed 
              in DevSecureX, including scan results, analytics charts, and activity logs.
            </p>
          </div>
          
          {isTimezoneManuallySet() && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Manual Timezone:</strong> Your timezone is manually set and will not change automatically
                when you travel. Use the "Auto-detect" button above to update based on your current location.
              </p>
            </div>
          )}
          
          {getTimezoneSource() === 'auto-detected' && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Auto-detected Timezone:</strong> Your timezone was automatically detected. 
                Any manual changes will override auto-detection to preserve your preference.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}