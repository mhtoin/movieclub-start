import { EmblaCarouselType, EmblaEventType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import MoviePoster from './movie-poster'

const TWEEN_FACTOR_BASE = 0.2

interface RaffleCarouselProps {
  movies: any[]
  raffleState: string
  winningMovie: any | null
  onRaffleComplete: () => void
}

export default function RaffleCarousel(props: RaffleCarouselProps) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  )

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Key forces remount when switching between mobile/desktop
  return (
    <div key={isMobile ? 'vertical' : 'horizontal'}>
      {isMobile ? (
        <VerticalRaffleCarousel {...props} />
      ) : (
        <HorizontalRaffleCarousel {...props} />
      )}
    </div>
  )
}

function VerticalRaffleCarousel({
  movies,
  raffleState,
  winningMovie,
  onRaffleComplete,
}: RaffleCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: false,
    dragFree: false,
    startIndex: 3,
    axis: 'y',
  })

  const tweenFactor = useRef(0)
  const tweenNodes = useRef<HTMLElement[]>([])
  const glowNodes = useRef<HTMLElement[]>([])

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector('.parallax__layer') as HTMLElement
    })
    glowNodes.current = tweenNodes.current.map((node) => {
      return node?.querySelector('.spotlight-glow') as HTMLElement
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
                if (sign === -1)
                  diffToTarget = scrollSnap - (1 + scrollProgress)
                if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress)
              }
            })
          }

          const translate = diffToTarget * (-1 * tweenFactor.current) * 100
          const tweenNode = tweenNodes.current[slideIndex]
          const distanceFromCenter = Math.abs(diffToTarget)

          // More dramatic scaling for vertical layout
          const scale = Math.max(0.65, 1.25 - distanceFromCenter * 0.9)
          const opacity = Math.max(0.2, 1 - distanceFromCenter * 1.6)
          const glowOpacity = Math.max(0, 1 - distanceFromCenter * 2.5)

          tweenNode.style.transform = `translate3d(0, ${translate}%, 0) scale(${scale})`
          tweenNode.style.opacity = `${opacity}`

          const glowElement = glowNodes.current[slideIndex]
          if (glowElement) {
            glowElement.style.opacity = `${glowOpacity}`
          }
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
  }, [emblaApi, tweenParallax, setTweenNodes, setTweenFactor])

  useEffect(() => {
    if (!emblaApi || raffleState !== 'spinning' || !winningMovie) return

    const winningIndex = movies.findIndex((m) => m.id === winningMovie.id)
    if (winningIndex === -1) return

    let currentSpeed = 1
    const maxSpeed = 1
    const minSpeed = 1200
    const totalDuration = 12000
    const startTime = Date.now()
    let timeoutId: NodeJS.Timeout

    const scheduleNextScroll = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / totalDuration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 1.5)
      currentSpeed = maxSpeed + (minSpeed - maxSpeed) * easeOut

      const currentIndex = emblaApi.selectedScrollSnap()
      let distanceToWinner = winningIndex - currentIndex
      if (distanceToWinner < 0) distanceToWinner += movies.length

      if (progress >= 1 || elapsed >= totalDuration) {
        if (distanceToWinner === 0) {
          onRaffleComplete()
          return
        } else if (distanceToWinner <= 5) {
          let finalScrolls = distanceToWinner
          let baseDelay = currentSpeed
          const doFinalScroll = () => {
            if (finalScrolls > 0) {
              emblaApi.scrollNext()
              finalScrolls--
              baseDelay += 200
              const randomVariation = (Math.random() - 0.5) * 200
              const delay = Math.max(200, baseDelay + randomVariation)
              setTimeout(doFinalScroll, delay)
            } else {
              onRaffleComplete()
            }
          }
          doFinalScroll()
          return
        } else {
          emblaApi.scrollNext()
          timeoutId = setTimeout(scheduleNextScroll, 10)
          return
        }
      }

      emblaApi.scrollNext()
      timeoutId = setTimeout(scheduleNextScroll, currentSpeed)
    }

    scheduleNextScroll()
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [emblaApi, raffleState, winningMovie, movies, onRaffleComplete])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const noopSetHovered = useCallback(() => {}, [])

  return (
    <div className="relative w-full h-[100dvh] animate-fade-in">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex flex-col items-center h-full">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex-[0_0_50%] min-h-0 w-[70vw] max-w-[300px] py-2"
            >
              <div className="parallax h-full">
                <div className="parallax__layer relative will-change-transform h-full flex items-center justify-center">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-primary/40 via-primary/20 to-transparent opacity-0 spotlight-glow pointer-events-none z-10" />
                  <MoviePoster
                    movie={movie}
                    movieIndex={0}
                    handleMovieClick={undefined}
                    hoveredMovieId={null}
                    setHoveredMovieId={noopSetHovered}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none z-20">
        <div className="flex items-center gap-3 px-2">
          <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-primary/60 to-primary rounded-full shadow-sm shadow-primary/30" />
          <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50 animate-pulse ring-2 ring-primary/30 ring-offset-2 ring-offset-background" />
          <div className="flex-1 h-1 bg-gradient-to-l from-transparent via-primary/60 to-primary rounded-full shadow-sm shadow-primary/30" />
        </div>
      </div>
      <button
        onClick={scrollPrev}
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 hover:bg-black/80 active:scale-95 text-white rounded-full p-3 transition-all z-30 backdrop-blur-sm shadow-lg touch-manipulation"
        aria-label="Previous movie"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 hover:bg-black/80 active:scale-95 text-white rounded-full p-3 transition-all z-30 backdrop-blur-sm shadow-lg touch-manipulation"
        aria-label="Next movie"
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </div>
  )
}

function HorizontalRaffleCarousel({
  movies,
  raffleState,
  winningMovie,
  onRaffleComplete,
}: RaffleCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
    startIndex: 3,
    axis: 'x',
  })

  const tweenFactor = useRef(0)
  const tweenNodes = useRef<HTMLElement[]>([])
  const glowNodes = useRef<HTMLElement[]>([])

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector('.parallax__layer') as HTMLElement
    })
    glowNodes.current = tweenNodes.current.map((node) => {
      return node?.querySelector('.spotlight-glow') as HTMLElement
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
                if (sign === -1)
                  diffToTarget = scrollSnap - (1 + scrollProgress)
                if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress)
              }
            })
          }

          const translate = diffToTarget * (-1 * tweenFactor.current) * 100
          const tweenNode = tweenNodes.current[slideIndex]
          const distanceFromCenter = Math.abs(diffToTarget)

          const scale = Math.max(0.85, 1.15 - distanceFromCenter * 0.6)
          const opacity = Math.max(0.4, 1 - distanceFromCenter * 1.2)
          const glowOpacity = Math.max(0, 1 - distanceFromCenter * 3)

          tweenNode.style.transform = `translate3d(${translate}%, 0, 0) scale(${scale})`
          tweenNode.style.opacity = `${opacity}`

          const glowElement = glowNodes.current[slideIndex]
          if (glowElement) {
            glowElement.style.opacity = `${glowOpacity}`
          }
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
  }, [emblaApi, tweenParallax, setTweenNodes, setTweenFactor])

  useEffect(() => {
    if (!emblaApi || raffleState !== 'spinning' || !winningMovie) return

    const winningIndex = movies.findIndex((m) => m.id === winningMovie.id)
    if (winningIndex === -1) return

    let currentSpeed = 1
    const maxSpeed = 1
    const minSpeed = 1200
    const totalDuration = 12000
    const startTime = Date.now()
    let timeoutId: NodeJS.Timeout

    const scheduleNextScroll = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / totalDuration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 1.5)
      currentSpeed = maxSpeed + (minSpeed - maxSpeed) * easeOut

      const currentIndex = emblaApi.selectedScrollSnap()
      let distanceToWinner = winningIndex - currentIndex
      if (distanceToWinner < 0) distanceToWinner += movies.length

      const estimatedScrollsRemaining = Math.ceil(
        (totalDuration - elapsed) / currentSpeed,
      )

      if (progress >= 1 || elapsed >= totalDuration) {
        if (distanceToWinner === 0) {
          onRaffleComplete()
          return
        } else if (distanceToWinner <= 5) {
          let finalScrolls = distanceToWinner
          let baseDelay = currentSpeed
          const doFinalScroll = () => {
            if (finalScrolls > 0) {
              emblaApi.scrollNext()
              finalScrolls--
              baseDelay += 200
              const randomVariation = (Math.random() - 0.5) * 200
              const delay = Math.max(200, baseDelay + randomVariation)
              setTimeout(doFinalScroll, delay)
            } else {
              onRaffleComplete()
            }
          }
          doFinalScroll()
          return
        } else {
          emblaApi.scrollNext()
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
        timeoutId = setTimeout(scheduleNextScroll, currentSpeed)
      } else if (progress < 0.85) {
        emblaApi.scrollNext()
        timeoutId = setTimeout(scheduleNextScroll, currentSpeed)
      } else {
        emblaApi.scrollNext()
        timeoutId = setTimeout(scheduleNextScroll, currentSpeed)
      }
    }

    scheduleNextScroll()
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [emblaApi, raffleState, winningMovie, movies, onRaffleComplete])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const noopSetHovered = useCallback(() => {}, [])

  return (
    <div className="relative w-full animate-fade-in">
      <div
        className="overflow-hidden fade-mask fade-16 dark:fade-80 fade-intensity-100"
        ref={emblaRef}
      >
        <div className="flex gap-6 pb-4 pl-6">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex-[0_0_min(70vw,200px)] md:flex-[0_0_min(60vw,280px)] lg:flex-[0_0_min(50vw,320px)] 2xl:flex-[0_0_min(40vw,500px)] min-w-0"
            >
              <div className="parallax">
                <div className="parallax__layer relative will-change-transform">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 spotlight-glow pointer-events-none" />
                  <MoviePoster
                    movie={movie}
                    movieIndex={0}
                    handleMovieClick={undefined}
                    hoveredMovieId={null}
                    setHoveredMovieId={noopSetHovered}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  )
}
