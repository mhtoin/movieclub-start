import { useMemo } from 'react'
import { Calendar, Film, Layers, User } from 'lucide-react'
import { ASPECT_RATIOS, THEME_DEFS } from './constants'
import { sortTiers } from './helpers'
import { CompactPosterModeBody } from './compact-poster-mode-body'
import { PosterModeBody } from './poster-mode-body'
import { TextListModeBody } from './text-list-mode-body'
import type { ShareStudioTierlist, StudioSettings } from './types'

export function ShareCanvas({
  tierlist,
  userName,
  settings,
  canvasRef,
}: {
  tierlist: ShareStudioTierlist
  userName: string | null | undefined
  settings: StudioSettings
  canvasRef: React.RefObject<HTMLDivElement | null>
}) {
  const theme = THEME_DEFS[settings.theme]
  const dims = ASPECT_RATIOS[settings.aspectRatio]
  const rankedTiers = sortTiers(
    tierlist.tiers.filter((t) => t.id !== 'unranked'),
    settings.tierOrder,
  ).filter((t) => !settings.hideEmptyTiers || t.movies.length > 0)

  const dateRangeText = useMemo(() => {
    const { watchDateFrom, watchDateTo } = tierlist
    if (!watchDateFrom && !watchDateTo) return null
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    if (watchDateFrom && watchDateTo)
      return `${fmt(watchDateFrom)} — ${fmt(watchDateTo)}`
    if (watchDateFrom) return `From ${fmt(watchDateFrom)}`
    if (watchDateTo) return `Until ${fmt(watchDateTo)}`
    return null
  }, [tierlist])

  const totalMovies = rankedTiers.reduce((acc, t) => acc + t.movies.length, 0)

  const getLabel = (tier: { label: string; value: number }) =>
    settings.tierLabelOverrides[tier.value] || tier.label

  const horizontalPad = 48

  const bgStyle = useMemo(() => {
    if (settings.backgroundType === 'image' && settings.backgroundImage) {
      return {
        backgroundImage: `url(${settings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    if (settings.backgroundType === 'solid') {
      return { background: settings.backgroundSolid }
    }
    return { background: theme.bg }
  }, [
    settings.backgroundType,
    settings.backgroundImage,
    settings.backgroundSolid,
    theme.bg,
  ])

  const accent = settings.accentColor ?? theme.accent

  return (
    <div
      ref={canvasRef}
      style={{
        width: dims.w,
        minHeight: dims.h,
        color: theme.fg,
        fontFamily: theme.font,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...bgStyle,
      }}
    >
      {settings.backgroundType === 'image' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `${theme.bg}cc`,
            zIndex: 1,
          }}
        />
      )}

      <div
        style={{
          padding: '44px 48px 32px',
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
        }}
      >
        {settings.showTitle && (
          <h1
            style={{
              fontSize: settings.displayMode === 'compact-posters' ? 44 : 52,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: 0,
              color: theme.fg,
              textWrap: 'balance',
            }}
          >
            {tierlist.title || 'Untitled Tierlist'}
          </h1>
        )}

        <div
          style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            flexWrap: 'wrap',
            fontSize: 15,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: theme.muted,
          }}
        >
          {settings.showAuthor && userName && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} />
              {userName}
            </span>
          )}
          {settings.showDateRange && dateRangeText && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} />
              {dateRangeText}
            </span>
          )}
          {settings.showMovieCount && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={14} />
              {totalMovies} films
            </span>
          )}
        </div>

        <div
          style={{
            width: 80,
            height: 3,
            background: accent,
            margin: '24px auto 0',
            borderRadius: 2,
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          padding: `0 ${horizontalPad}px ${horizontalPad - 4}px`,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {settings.displayMode === 'posters' && (
          <PosterModeBody
            rankedTiers={rankedTiers}
            settings={settings}
            getLabel={getLabel}
          />
        )}
        {settings.displayMode === 'compact-posters' && (
          <CompactPosterModeBody
            rankedTiers={rankedTiers}
            settings={settings}
            getLabel={getLabel}
          />
        )}
        {settings.displayMode === 'text-list' && (
          <TextListModeBody
            rankedTiers={rankedTiers}
            settings={settings}
            getLabel={getLabel}
          />
        )}
      </div>

      <div
        style={{
          padding: `24px ${horizontalPad}px`,
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
          color: theme.muted,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Film size={14} /> MovieClub
        </span>
        <span>Tierlist</span>
      </div>
    </div>
  )
}
