import { Tabs } from '@base-ui/react/tabs'
import { motion, Transition } from 'framer-motion'
import { Calendar, Dices } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import RaffleSettings from './raffle-settings'

interface RaffleControlTabProps {
  value: string
  onStartRaffle: () => void
  onDateSelect: (date: Date) => void
  selectedDate?: Date
  dryRun: boolean
  onDryRunChange: (value: boolean) => void
}

const spring: Transition = {
  type: 'spring',
  damping: 20,
  stiffness: 300,
}

export function RaffleControlTab({
  value,
  onStartRaffle,
  onDateSelect,
  selectedDate,
  dryRun,
  onDryRunChange,
}: RaffleControlTabProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  return (
    <Tabs.Tab
      value={value}
      render={<div className="group/tab" />}
      nativeButton={false}
    >
      <motion.div
        layout
        transition={spring}
        className={`flex flex-col mb-5 bg-card border shadow-md hover:shadow-xl max-w-sm transition-all duration-300 relative overflow-hidden rounded-2xl p-6 group-data-[selected]/tab:border-primary group-data-[selected]/tab:shadow-primary/20 group-data-[selected]/tab:shadow-xl group-data-[selected]/tab:scale-105 border-border`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-data-[selected]/tab:opacity-100 transition-opacity duration-300 rounded-2xl" />
        <div className="absolute top-2 right-2">
          <RaffleSettings dryRun={dryRun} onDryRunChange={onDryRunChange} />
        </div>
        <div className="flex flex-col gap-3 relative z-10">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onStartRaffle()
            }}
            disabled={!selectedDate}
            variant={'primary'}
            className="flex items-center gap-3 px-4 py-6 bg-primary rounded-xl transition-all duration-200 group/button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="relative flex-shrink-0">
              <Dices className="h-6 w-6 text-primary-foreground transition-transform group-hover/button:rotate-12" />
            </div>
            <span className="text-sm font-semibold text-primary-foreground whitespace-nowrap">
              Start Raffle
            </span>
          </Button>
          <div className="flex flex-col gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                setShowDatePicker(!showDatePicker)
              }}
              variant={'secondary'}
              className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 group/date"
            >
              <Calendar className="h-5 w-5 text-secondary-foreground group-hover/date:rotate-12 transition-transform" />
              <span className="text-xs text-secondary-foreground transition-colors">
                {selectedDate
                  ? selectedDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Pick watch date'}
              </span>
            </Button>
            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <input
                  type="date"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const date = new Date(e.target.value)
                    onDateSelect(date)
                    setShowDatePicker(false)
                  }}
                  value={
                    selectedDate ? selectedDate.toISOString().split('T')[0] : ''
                  }
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  min={new Date().toISOString().split('T')[0]}
                />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </Tabs.Tab>
  )
}
