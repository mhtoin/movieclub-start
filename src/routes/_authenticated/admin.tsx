import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion'

import { Cog, Dices, Film, ListPlus, Megaphone, Plus } from 'lucide-react'
import type { Announcement } from '@/db/schema/announcements'
import { Button } from '@/components/ui/button'
import { announcementQueries } from '@/lib/react-query/queries/announcements'
import { useDeleteAnnouncement } from '@/lib/react-query/mutations/announcements'
import { Tab, TabsList, TabsPanel, TabsRoot } from '@/components/ui/tabs'
import { AddWatchedMovie } from '@/components/admin/add-watched-movie'
import { AdminEmptyState } from '@/components/admin/empty-state'
import { AdminForm } from '@/components/admin/admin-form'
import {
  AnnouncementCard,
  AnnouncementCounts,
} from '@/components/admin/announcement-card'
import { ManageShortlists } from '@/components/admin/manage-shortlists'
import { canAccessAdminPanel } from '@/lib/auth/permissions'
import { adminQueries } from '@/lib/react-query/queries/admin'
import { RaffleRandomnessCheck } from '@/components/admin/raffle-randomness-check'
import { SiteConfigForm } from '@/components/admin/site-config-form'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context }) => {
    if (!canAccessAdminPanel(context.user.role)) {
      throw redirect({ to: '/home' })
    }
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(announcementQueries.admin()),
      context.queryClient.ensureQueryData(adminQueries.shortlists()),
      context.queryClient.ensureQueryData(adminQueries.siteConfig()),
    ])
  },
  component: AdminPage,
})

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.25 } },
}

function AdminPage() {
  const { data: announcements } = useSuspenseQuery(announcementQueries.admin())
  const { data: shortlists } = useSuspenseQuery(adminQueries.shortlists())
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const deleteMutation = useDeleteAnnouncement()

  const handleEdit = (announcement: Announcement) => {
    setEditing(announcement)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setEditing(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="min-h-screen relative">
      {/* Ambient warm glow behind header */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 md:py-14">
        <header className="mb-8 md:mb-10">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'var(--primary)' }}
          >
            Projection Booth
          </p>
          <h1
            className="text-4xl font-bold tracking-tight md:text-5xl"
            style={{ fontFamily: 'var(--font-cinema), Oswald, sans-serif' }}
          >
            Club Administration
          </h1>
          <p className="mt-2 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Keep the club&apos;s shared movie night running smoothly.
          </p>
        </header>

        <TabsRoot defaultValue="announcements" variant="underlined">
          <TabsList
            variant="underlined"
            className="gap-8 border-b border-border/40"
          >
            <Tab value="announcements" variant="underlined">
              <Megaphone className="mr-2 size-4" />
              Announcements
            </Tab>
            <Tab value="watched" variant="underlined">
              <Film className="mr-2 size-4" />
              Record watched movie
            </Tab>
            <Tab value="shortlists" variant="underlined">
              <ListPlus className="mr-2 size-4" />
              Manage shortlists
            </Tab>
            <Tab value="randomness" variant="underlined">
              <Dices className="mr-2 size-4" />
              Raffle randomness
            </Tab>
            <Tab value="site-config" variant="underlined">
              <Cog className="mr-2 size-4" />
              Site configuration
            </Tab>
          </TabsList>

          <TabsPanel value="watched" variant="underlined">
            <AddWatchedMovie />
          </TabsPanel>

          <TabsPanel value="shortlists" variant="underlined">
            <ManageShortlists />
          </TabsPanel>

          <TabsPanel value="randomness" variant="underlined">
            <RaffleRandomnessCheck shortlists={shortlists} />
          </TabsPanel>

          <TabsPanel value="site-config" variant="underlined">
            <SiteConfigForm />
          </TabsPanel>

          <TabsPanel value="announcements" variant="underlined">
            <header className="mb-12 flex items-start justify-between gap-6 md:mb-16">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Announcements
                </h2>
                <p className="mt-2 max-w-lg text-base leading-relaxed text-muted-foreground">
                  Manage What&apos;s New announcements for your crew.
                  What&apos;s on the marquee?
                </p>
              </div>
              <Button
                variant="primary"
                size="default"
                onClick={handleNew}
                className="shrink-0 shadow-lg shadow-primary/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Posting
              </Button>
            </header>

            <AnnouncementCounts announcements={announcements} />

            <LazyMotion features={domAnimation}>
              <AnimatePresence mode="popLayout">
                {announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <m.div
                        key={announcement.id}
                        layout
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <AnnouncementCard
                          announcement={announcement}
                          onEdit={() => handleEdit(announcement)}
                          onDelete={() =>
                            deleteMutation.mutate({ id: announcement.id })
                          }
                        />
                      </m.div>
                    ))}
                  </div>
                ) : (
                  <AdminEmptyState onCreate={handleNew} />
                )}
              </AnimatePresence>
            </LazyMotion>
          </TabsPanel>
        </TabsRoot>
      </div>

      <AdminForm
        key={editing?.id ?? 'new'}
        editing={editing}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSaved={() => {
          setIsDialogOpen(false)
          setEditing(null)
        }}
      />
    </div>
  )
}
