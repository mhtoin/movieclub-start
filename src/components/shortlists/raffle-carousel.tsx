import { EmblaCarouselType, EmblaEventType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'
import MoviePoster from './movie-poster'

const TWEEN_FACTOR_BASE = 0.2

export default function RaffleCarousel({
  movies,
  raffleState,
  winningMovie,
  onRaffleComplete,
}: {
  movies: any[]
  raffleState: string
  winningMovie: any | null
  onRaffleComplete: () => void
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
    startIndex: 3,
  })
  const tweenFactor = useRef(0)
  const tweenNodes = useRef<HTMLElement[]>([])

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector('.parallax__layer') as HTMLElement
    })
  }, [])

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
  }, [])

  const tweenParallax = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine()
      const scrollProgress = emblaApi.scrollProgress()
      const slidesInView = emblaApi.slidesInView()
      const isScrollEvent = eventName === 'scroll'

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress
        const slidesInSnap = engine.slideRegistry[snapIndex]

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target()

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target)

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress)
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress)
                }
              }
            })
          }

          const translate = diffToTarget * (-1 * tweenFactor.current) * 100
          const tweenNode = tweenNodes.current[slideIndex]
          tweenNode.style.transform = `translateX(${translate}%)`
        })
      })
    },
    [],
  )

  useEffect(() => {
    if (!emblaApi) return

    setTweenNodes(emblaApi)
    setTweenFactor(emblaApi)
    tweenParallax(emblaApi)

    emblaApi
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenParallax)
      .on('scroll', tweenParallax)
      .on('slideFocus', tweenParallax)
  }, [emblaApi, tweenParallax])

  useEffect(() => {
    if (!emblaApi || raffleState !== 'spinning' || !winningMovie) return

    const winningIndex = movies.findIndex((m) => m.id === winningMovie.id)
    if (winningIndex === -1) return

    let currentSpeed = 1
    const maxSpeed = 1
    const minSpeed = 1200
    const totalDuration = 12000
    const startTime = Date.now()

    let scrollCount = 0
    let timeoutId: NodeJS.Timeout

    const scheduleNextScroll = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / totalDuration, 1)

      const easeOut = 1 - Math.pow(1 - progress, 1.5)
      currentSpeed = maxSpeed + (minSpeed - maxSpeed) * easeOut

      const currentIndex = emblaApi.selectedScrollSnap()
      let distanceToWinner = winningIndex - currentIndex

      console.log({
        easeOut,
        scrollCount,
        elapsed,
        progress,
        currentSpeed,
        distanceToWinner,
      })

      if (distanceToWinner < 0) {
        distanceToWinner += movies.length
      }

      const estimatedScrollsRemaining = Math.ceil(
        (totalDuration - elapsed) / currentSpeed,
      )

      if (progress >= 1 || elapsed >= totalDuration) {
        const finalDistance = distanceToWinner

        if (finalDistance === 0) {
          onRaffleComplete()
          return
        } else if (finalDistance <= 5) {
          let finalScrolls = finalDistance
          let baseDelay = currentSpeed

          const doFinalScroll = () => {
            if (finalScrolls > 0) {
              console.log('Final scroll to winner, remaining:', finalScrolls)
              emblaApi.scrollNext()
              finalScrolls--

              baseDelay += 200

              const randomVariation = (Math.random() - 0.5) * 200
              const delay = Math.max(200, baseDelay + randomVariation)
              console.log('Next final scroll in ms:', delay)

              setTimeout(doFinalScroll, delay)
            } else {
              onRaffleComplete()
            }
          }
          doFinalScroll()
          return
        } else {
          emblaApi.scrollNext()
          scrollCount++
          timeoutId = setTimeout(scheduleNextScroll, 10)
          return
        }
      }

      if (
        progress > 0.85 &&
        distanceToWinner > 0 &&
        distanceToWinner <= estimatedScrollsRemaining
      ) {
        emblaApi.scrollNext()
        scrollCount++
        timeoutId = setTimeout(scheduleNextScroll, currentSpeed)
      } else if (progress < 0.85) {
        emblaApi.scrollNext()
        scrollCount++
        timeoutId = setTimeout(scheduleNextScroll, currentSpeed)
      } else {
        emblaApi.scrollNext()
        scrollCount++
        timeoutId = setTimeout(scheduleNextScroll, currentSpeed)
      }
    }

    scheduleNextScroll()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [emblaApi, raffleState, winningMovie, movies, onRaffleComplete])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <motion.div
      layout
      className="relative w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="overflow-hidden fade-mask fade-16 dark:fade-80 fade-intensity-100"
        ref={emblaRef}
      >
        <div className="flex gap-6 pb-4 pl-6">
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              className="flex-[0_0_min(85vw,150px)] sm:flex-[0_0_min(70vw,200px)] md:flex-[0_0_min(60vw,280px)] lg:flex-[0_0_min(50vw,320px)] 2xl:flex-[0_0_min(40vw,500px)] min-w-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="parallax">
                <div className="parallax__layer">
                  <MoviePoster
                    movie={movie}
                    movieIndex={0}
                    handleMovieClick={undefined}
                    hoveredMovieId={null}
                    setHoveredMovieId={() => {}}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </motion.div>
  )
}
