import { useCallback, useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion'
import {
  Download,
  ImageIcon,
  LayoutGrid,
  LayoutTemplate,
  List,
  Loader2,
  MessageSquare,
  MoveVertical,
  Paintbrush,
  Palette,
  Save,
  Share2,
  Star,
  Trash2,
  Type,
  X,
} from 'lucide-react'
import { Toast } from '@base-ui/react/toast'
import {
  ASPECT_RATIOS,
  DEFAULT_SETTINGS,
  PRESETS_STORAGE_KEY,
  THEME_DEFS,
} from './constants'
import { ShareCanvas } from './share-canvas'
import { BackgroundControls } from './background-controls'
import { ControlSection } from './control-section'
import { AspectRatioPicker } from './aspect-ratio-picker'
import { DisplayModePicker } from './display-mode-picker'
import { TemplateSelector } from './template-selector'
import { ToggleRow } from './toggle-row'
import { SegmentedControl } from './segmented-control'
import { TierLabelEditor } from './tier-label-editor'
import { TierOrderEditor } from './tier-order-editor'
import { ThemeSwatches } from './theme-swatches'
import type {
  SharePreset,
  ShareStudioTierlist,
  StudioSettings,
  TextColumns,
} from './types'
import { Button } from '@/components/ui/button'

export function TierlistShareStudio({
  tierlist,
  userName,
  open,
  onOpenChange,
}: {
  tierlist: ShareStudioTierlist
  userName: string | null | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [settings, setSettings] = useState<StudioSettings>(DEFAULT_SETTINGS)
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isSharingToDiscord, setIsSharingToDiscord] = useState(false)
  const [presetName, setPresetName] = useState('')
  const initializedRef = useRef(false)
  const toastManager = Toast.useToastManager()

  const lastTierlistIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!open) return
    const currentId = tierlist.tiers[0]?.tierlistId ?? null
    if (lastTierlistIdRef.current !== currentId) {
      initializedRef.current = false
      lastTierlistIdRef.current = currentId
    }
    if (!initializedRef.current) {
      initializedRef.current = true
      const overrides: Record<string, string> = {}
      for (const tier of tierlist.tiers) {
        if (tier.id !== 'unranked') {
          overrides[tier.value] = tier.label
        }
      }
      setSettings((prev) => ({
        ...prev,
        tierLabelOverrides: overrides,
        tierOrder: tierlist.tiers
          .filter((t) => t.id !== 'unranked')
          .sort((a, b) => a.value - b.value)
          .map((t) => t.id),
      }))
    }
  }, [open, tierlist.tiers])

  const [presets, setPresets] = useState<Array<SharePreset>>(() => {
    try {
      const raw = localStorage.getItem(PRESETS_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as Array<SharePreset>
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  const savePreset = useCallback(() => {
    const name = presetName.trim()
    if (!name) return
    const preset: SharePreset = {
      name,
      settings: (({
        backgroundImage,
        tierLabelOverrides,
        tierLabelCustomColors,
        tierOrder,
        ...rest
      }) => rest)(settings),
      createdAt: Date.now(),
    }
    setPresets((prev) => {
      const next = [...prev, preset]
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(next))
      return next
    })
    setPresetName('')
    toastManager.add({
      title: 'Saved',
      description: `Preset "${name}" saved`,
      type: 'success',
    })
  }, [presetName, settings, toastManager])

  const loadPreset = useCallback(
    (preset: SharePreset) => {
      setSettings((prev) => ({
        ...prev,
        ...preset.settings,
      }))
      setActiveTemplate(null)
      toastManager.add({
        title: 'Loaded',
        description: `Preset "${preset.name}" applied`,
        type: 'success',
      })
    },
    [toastManager],
  )

  const deletePreset = useCallback(
    (index: number) => {
      setPresets((prev) => {
        const next = prev.filter((_, i) => i !== index)
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(next))
        return next
      })
      toastManager.add({
        title: 'Deleted',
        description: 'Preset removed',
        type: 'success',
      })
    },
    [toastManager],
  )

  const update = useCallback(
    <TKey extends keyof StudioSettings>(
      key: TKey,
      value: StudioSettings[TKey],
    ) => {
      setSettings((s) => ({ ...s, [key]: value }))
      setActiveTemplate(null)
    },
    [],
  )

  const updateMany = useCallback((partial: Partial<StudioSettings>) => {
    setSettings((s) => ({ ...s, ...partial }))
  }, [])

  const handleTemplate = useCallback(
    (key: string, tmplSettings: Partial<StudioSettings>) => {
      setSettings((s) => ({ ...DEFAULT_SETTINGS, ...s, ...tmplSettings }))
      setActiveTemplate(key)
    },
    [],
  )

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return
    setIsExporting(true)
    try {
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: false,
      })
      const link = document.createElement('a')
      link.download = `${tierlist.title || 'tierlist'}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }, [tierlist.title])

  const handleShareToDiscord = useCallback(async () => {
    if (!canvasRef.current) return
    setIsSharingToDiscord(true)
    try {
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: false,
      })

      const parts: Array<string> = []
      if (tierlist.title) parts.push(`"${tierlist.title}"`)
      if (
        settings.showDateRange &&
        tierlist.watchDateFrom &&
        tierlist.watchDateTo
      ) {
        const from = new Date(tierlist.watchDateFrom).toLocaleDateString(
          undefined,
          { month: 'short', year: 'numeric' },
        )
        const to = new Date(tierlist.watchDateTo).toLocaleDateString(
          undefined,
          { month: 'short', year: 'numeric' },
        )
        parts.push(`(${from} – ${to})`)
      }
      const content =
        parts.length > 0
          ? `Check out my tierlist: ${parts.join(' ')}`
          : 'Check out my tierlist!'

      const response = await fetch('/api/tierlists/share/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageBlob: dataUrl }),
      })

      if (response.ok) {
        toastManager.add({
          title: 'Shared',
          description: 'Tierlist posted to Discord!',
          type: 'success',
        })
      } else {
        const data = (await response
          .json()
          .catch(() => ({ error: 'Unknown error' }))) as {
          error?: string
        }
        toastManager.add({
          title: 'Error',
          description: data.error || 'Failed to post to Discord',
          type: 'error',
        })
      }
    } catch (err) {
      console.error('Discord share failed:', err)
      toastManager.add({
        title: 'Error',
        description: 'Failed to post to Discord',
        type: 'error',
      })
    } finally {
      setIsSharingToDiscord(false)
    }
  }, [
    tierlist.title,
    tierlist.watchDateFrom,
    tierlist.watchDateTo,
    settings.showDateRange,
    toastManager,
  ])

  const dims = ASPECT_RATIOS[settings.aspectRatio]

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => onOpenChange(false)}
          >
            <m.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative flex h-[90vh] w-full max-w-[1400px] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 h-8 w-8 rounded-full"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex-1 flex flex-col min-w-0 bg-muted/30">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                  <Share2 className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">
                    Director&apos;s Studio
                  </h2>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {dims.w}×{dims.h}
                  </span>
                </div>

                <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
                  <div
                    className="shadow-2xl"
                    style={{
                      transform: `scale(${Math.min(
                        1,
                        (typeof window !== 'undefined'
                          ? window.innerWidth * 0.5
                          : 600) / dims.w,
                      )})`,
                      transformOrigin: 'top center',
                    }}
                  >
                    <ShareCanvas
                      tierlist={tierlist}
                      userName={userName}
                      settings={settings}
                      canvasRef={canvasRef}
                    />
                  </div>
                </div>
              </div>

              <div className="w-[380px] flex flex-col border-l border-border bg-background shrink-0">
                <div className="flex-1 overflow-y-auto p-5 space-y-7">
                  <ControlSection title="Start from template" icon={LayoutGrid}>
                    <TemplateSelector
                      currentTemplate={activeTemplate}
                      onSelect={handleTemplate}
                    />
                  </ControlSection>

                  <ControlSection title="Presets" icon={Save}>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={presetName}
                          onChange={(e) => setPresetName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') savePreset()
                          }}
                          placeholder="Preset name"
                          className="flex-1 min-w-0 h-8 px-2.5 rounded-md border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={savePreset}
                          disabled={!presetName.trim()}
                        >
                          Save
                        </Button>
                      </div>
                      {presets.length > 0 && (
                        <div className="space-y-1.5">
                          {presets.map((preset, i) => (
                            <div
                              key={preset.name}
                              className="flex items-center gap-2 group"
                            >
                              <button
                                onClick={() => loadPreset(preset)}
                                className="flex-1 text-left px-2.5 py-1.5 rounded-md border border-border bg-muted hover:border-primary/30 transition-all text-xs text-foreground"
                              >
                                {preset.name}
                              </button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deletePreset(i)}
                                title="Delete preset"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ControlSection>

                  <ControlSection title="Theme" icon={Palette}>
                    <ThemeSwatches
                      value={settings.theme}
                      onChange={(t) => update('theme', t)}
                    />
                  </ControlSection>

                  <ControlSection title="Accent Color" icon={Paintbrush}>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={
                          settings.accentColor ??
                          THEME_DEFS[settings.theme].accent
                        }
                        onChange={(e) => update('accentColor', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border-0 p-0 overflow-hidden shrink-0"
                      />
                      <span className="text-sm text-muted-foreground font-mono">
                        {settings.accentColor ??
                          THEME_DEFS[settings.theme].accent}
                      </span>
                      {settings.accentColor && (
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-[10px] uppercase tracking-wider font-medium"
                          onClick={() => update('accentColor', null)}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </ControlSection>

                  <ControlSection title="Background" icon={ImageIcon}>
                    <BackgroundControls
                      settings={settings}
                      onChange={updateMany}
                    />
                  </ControlSection>

                  <ControlSection title="Format" icon={LayoutTemplate}>
                    <AspectRatioPicker
                      value={settings.aspectRatio}
                      onChange={(a) => update('aspectRatio', a)}
                    />
                  </ControlSection>

                  <ControlSection title="Layout" icon={LayoutGrid}>
                    <DisplayModePicker
                      value={settings.displayMode}
                      onChange={(d) => update('displayMode', d)}
                    />
                  </ControlSection>

                  <ControlSection title="Tier Order" icon={MoveVertical}>
                    <TierOrderEditor
                      tiers={tierlist.tiers}
                      order={settings.tierOrder}
                      theme={settings.theme}
                      onChange={(o) => update('tierOrder', o)}
                    />
                  </ControlSection>

                  <ControlSection title="Content" icon={Type}>
                    <div className="space-y-3">
                      <ToggleRow
                        label="Show title"
                        checked={settings.showTitle}
                        onChange={(v) => update('showTitle', v)}
                      />
                      <ToggleRow
                        label="Show author"
                        checked={settings.showAuthor}
                        onChange={(v) => update('showAuthor', v)}
                      />
                      <ToggleRow
                        label="Show date range"
                        checked={settings.showDateRange}
                        onChange={(v) => update('showDateRange', v)}
                      />
                      <ToggleRow
                        label="Show movie count"
                        checked={settings.showMovieCount}
                        onChange={(v) => update('showMovieCount', v)}
                      />
                      <ToggleRow
                        label="Show tier labels"
                        checked={settings.showTierLabels}
                        onChange={(v) => update('showTierLabels', v)}
                      />
                      <ToggleRow
                        label="Hide empty tiers"
                        checked={settings.hideEmptyTiers}
                        onChange={(v) => update('hideEmptyTiers', v)}
                      />
                    </div>
                  </ControlSection>

                  <ControlSection title="Tier Labels" icon={Star}>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-xs text-muted-foreground font-medium">
                          Shape
                        </span>
                        <SegmentedControl
                          options={[
                            { label: 'Rounded', value: 'rounded' },
                            { label: 'Square', value: 'square' },
                            { label: 'Circle', value: 'circle' },
                            { label: 'Pill', value: 'pill' },
                          ]}
                          value={settings.tierLabelShape}
                          onChange={(v) => update('tierLabelShape', v)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs text-muted-foreground font-medium">
                          Style
                        </span>
                        <SegmentedControl
                          options={[
                            { label: 'Badge', value: 'badge' },
                            { label: 'Outline', value: 'letter' },
                          ]}
                          value={settings.tierLabelStyle}
                          onChange={(v) => update('tierLabelStyle', v)}
                        />
                      </div>
                      <TierLabelEditor
                        tiers={tierlist.tiers}
                        overrides={settings.tierLabelOverrides}
                        customColors={settings.tierLabelCustomColors}
                        theme={settings.theme}
                        onOverridesChange={(o) =>
                          update('tierLabelOverrides', o)
                        }
                        onColorsChange={(c) =>
                          update('tierLabelCustomColors', c)
                        }
                      />
                    </div>
                  </ControlSection>

                  {settings.displayMode === 'posters' && (
                    <ControlSection title="Poster Style" icon={ImageIcon}>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <span className="text-xs text-muted-foreground font-medium">
                            Size
                          </span>
                          <SegmentedControl
                            options={[
                              { label: 'Small', value: 'sm' },
                              { label: 'Medium', value: 'md' },
                              { label: 'Large', value: 'lg' },
                            ]}
                            value={settings.posterSize}
                            onChange={(v) => update('posterSize', v)}
                          />
                        </div>
                      </div>
                    </ControlSection>
                  )}

                  {settings.displayMode === 'compact-posters' && (
                    <ControlSection title="Compact Style" icon={LayoutGrid}>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <span className="text-xs text-muted-foreground font-medium">
                            Poster size
                          </span>
                          <SegmentedControl
                            options={[
                              { label: 'XS', value: 'xs' },
                              { label: 'Small', value: 'sm' },
                              { label: 'Medium', value: 'md' },
                            ]}
                            value={settings.compactPosterSize}
                            onChange={(v) => update('compactPosterSize', v)}
                          />
                        </div>
                      </div>
                    </ControlSection>
                  )}

                  {settings.displayMode === 'text-list' && (
                    <ControlSection title="Text List" icon={List}>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <span className="text-xs text-muted-foreground font-medium">
                            Columns
                          </span>
                          <SegmentedControl
                            options={[
                              { label: '1', value: '1' },
                              { label: '2', value: '2' },
                              { label: '3', value: '3' },
                              { label: '4', value: '4' },
                              { label: '5', value: '5' },
                            ]}
                            value={String(settings.textListColumns)}
                            onChange={(v) =>
                              update(
                                'textListColumns',
                                Number(v) as TextColumns,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2 pt-1">
                          <ToggleRow
                            label="Show year"
                            checked={settings.showMovieYear}
                            onChange={(v) => update('showMovieYear', v)}
                          />
                          <ToggleRow
                            label="Show runtime"
                            checked={settings.showMovieRuntime}
                            onChange={(v) => update('showMovieRuntime', v)}
                          />
                          <ToggleRow
                            label="Show rating"
                            checked={settings.showMovieRating}
                            onChange={(v) => update('showMovieRating', v)}
                          />
                          <ToggleRow
                            label="Show genres"
                            checked={settings.showMovieGenres}
                            onChange={(v) => update('showMovieGenres', v)}
                          />
                        </div>
                      </div>
                    </ControlSection>
                  )}
                </div>

                <div className="p-5 border-t border-border bg-muted/30 space-y-3">
                  <Button
                    onClick={handleExport}
                    disabled={isExporting || isSharingToDiscord}
                    className="w-full h-11 gap-2 text-base"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Exporting…
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download PNG
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleShareToDiscord}
                    disabled={isSharingToDiscord || isExporting}
                    className="w-full h-11 gap-2 text-base"
                    variant="outline"
                  >
                    {isSharingToDiscord ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sharing…
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4" />
                        Share to Discord
                      </>
                    )}
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Image exports at 2× resolution for crisp sharing
                  </p>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  )
}
