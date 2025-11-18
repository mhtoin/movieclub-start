import { Tabs } from '@base-ui-components/react/tabs'
import { motion } from 'framer-motion'
import { Calendar, Dices } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'

interface RaffleControlTabProps {
  value: string
  onStartRaffle: () => void
  onDateSelect: (date: Date) => void
  selectedDate?: Date
}

export function RaffleControlTab({
  value,
  onStartRaffle,
  onDateSelect,
  selectedDate,
}: RaffleControlTabProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  return (
    <Tabs.Tab value={value} className="group/tab">
      <motion.div
        layout
        className={`flex flex-col mb-5 bg-card border shadow-md hover:shadow-xl max-w-sm transition-all duration-300 relative overflow-hidden rounded-2xl p-4 group-data-[selected]/tab:border-primary group-data-[selected]/tab:shadow-primary/20 group-data-[selected]/tab:shadow-xl group-data-[selected]/tab:scale-105 border-border`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-data-[selected]/tab:opacity-100 transition-opacity duration-300 rounded-2xl" />

        <div className="flex flex-col gap-3 relative z-10">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onStartRaffle()
            }}
            className="flex items-center gap-3 px-4 py-3 bg-primary/10 hover:bg-primary/20 rounded-xl transition-all duration-200 border border-primary/20 hover:border-primary/40 group/button"
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center transition-all duration-300 group-hover/button:bg-primary/30">
                <Dices className="h-6 w-6 text-primary transition-transform group-hover/button:rotate-12" />
              </div>
            </div>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              Start Raffle
            </span>
          </Button>
          <div className="flex flex-col gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                setShowDatePicker(!showDatePicker)
              }}
              className="flex items-center gap-3 px-4 py-2 bg-secondary/50 hover:bg-secondary/70 rounded-xl transition-all duration-200 border border-border hover:border-primary/30 group/date"
            >
              <Calendar className="h-5 w-5 text-muted-foreground group-hover/date:text-primary transition-colors" />
              <span className="text-xs text-muted-foreground group-hover/date:text-foreground transition-colors">
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
