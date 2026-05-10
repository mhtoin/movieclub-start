import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { SegmentedControl } from './segmented-control'
import type { StudioSettings } from './types'
import { Button } from '@/components/ui/button'

export function BackgroundControls({
  settings,
  onChange,
}: {
  settings: StudioSettings
  onChange: (s: Partial<StudioSettings>) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onChange({
        backgroundType: 'image',
        backgroundImage: ev.target?.result as string,
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3">
      <SegmentedControl
        options={[
          { label: 'Theme', value: 'theme' },
          { label: 'Solid', value: 'solid' },
          { label: 'Image', value: 'image' },
        ]}
        value={settings.backgroundType}
        onChange={(v) => onChange({ backgroundType: v })}
      />

      {settings.backgroundType === 'solid' && (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={settings.backgroundSolid}
            onChange={(e) => onChange({ backgroundSolid: e.target.value })}
            className="h-8 w-8 rounded cursor-pointer border-0 p-0 overflow-hidden shrink-0"
          />
          <span className="text-sm text-muted-foreground font-mono">
            {settings.backgroundSolid}
          </span>
        </div>
      )}

      {settings.backgroundType === 'image' && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <Button
            variant="default"
            size="sm"
            className="w-full justify-start"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 text-muted-foreground" />
            {settings.backgroundImage ? 'Change image' : 'Upload background'}
          </Button>
          {settings.backgroundImage && (
            <div className="flex items-center gap-2">
              <div
                className="h-10 w-10 rounded-md border bg-cover bg-center"
                style={{ backgroundImage: `url(${settings.backgroundImage})` }}
              />
              <Button
                variant="ghost"
                size="xs"
                className="text-[10px] uppercase tracking-wider font-medium"
                onClick={() => onChange({ backgroundImage: null })}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
