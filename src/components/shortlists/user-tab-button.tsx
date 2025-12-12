import { Tabs } from '@base-ui/react/tabs'
import { motion, Transition } from 'framer-motion'
import { Clapperboard, Users } from 'lucide-react'

interface UserTabButtonProps {
  value: string
  index?: number
  movieCount: number
  name: string
  imageUrl?: string
  isAllUsers?: boolean
}

const spring: Transition = {
  type: 'spring',
  damping: 20,
  stiffness: 300,
}

export function UserTabButton({
  value,
  index = 0,
  movieCount,
  name,
  imageUrl,
  isAllUsers = false,
}: UserTabButtonProps) {
  return (
    <Tabs.Tab
      value={value}
      className="group/tab w-full text-left"
      nativeButton={false}
    >
      <motion.div
        layout
        transition={spring}
        className={`flex bg-card border shadow-md hover:shadow-xl max-w-sm transition-all duration-300 relative overflow-hidden rounded-2xl p-4 group-data-[selected]/tab:border-primary group-data-[selected]/tab:shadow-primary/20 group-data-[selected]/tab:shadow-xl group-data-[selected]/tab:scale-105 border-border`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-data-[selected]/tab:opacity-100 transition-opacity duration-300 rounded-2xl" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative flex-shrink-0">
            {isAllUsers ? (
              <div className="w-10 h-10 rounded-full border-2 shadow-md flex items-center justify-center text-2xl transition-all duration-300 border-border group-data-[selected]/tab:border-primary group-data-[selected]/tab:bg-primary/10">
                <Users className="h-6 w-6 text-foreground transition-colors group-data-[selected]/tab:text-primary" />
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={name}
                className="w-10 h-10 rounded-full border-2 shadow-md transition-all duration-300 border-border group-data-[selected]/tab:border-primary group-data-[selected]/tab:shadow-primary/30"
              />
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-card transition-transform group-data-[selected]/tab:scale-125" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              {name}
            </span>
            <div className="flex items-center text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
              <span className="text-xs">{movieCount}</span>
              <Clapperboard className="h-4 w-4 ml-1 text-muted-foreground" />
            </div>
          </div>
        </div>
      </motion.div>
    </Tabs.Tab>
  )
}
