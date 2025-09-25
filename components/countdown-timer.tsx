"use client"

import { useState, useEffect } from "react"
import { getTimeRemaining } from "@/lib/promotions-client"

interface CountdownTimerProps {
  endDate: string | Date
  className?: string
  onExpire?: () => void
}

export function CountdownTimer({ endDate, className = "", onExpire }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(endDate))

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(endDate)
      setTimeRemaining(remaining)

      if (remaining.total <= 0 && onExpire) {
        onExpire()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate, onExpire])

  if (timeRemaining.total <= 0) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-lg font-semibold text-red-600">¡Promoción expirada!</div>
      </div>
    )
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        <div className="bg-primary/10 rounded-lg p-2 md:p-4">
          <div className="text-lg md:text-2xl font-bold text-primary">{timeRemaining.days}</div>
          <div className="text-xs md:text-sm text-muted-foreground">Días</div>
        </div>
        <div className="bg-primary/10 rounded-lg p-2 md:p-4">
          <div className="text-lg md:text-2xl font-bold text-primary">{timeRemaining.hours}</div>
          <div className="text-xs md:text-sm text-muted-foreground">Horas</div>
        </div>
        <div className="bg-primary/10 rounded-lg p-2 md:p-4">
          <div className="text-lg md:text-2xl font-bold text-primary">{timeRemaining.minutes}</div>
          <div className="text-xs md:text-sm text-muted-foreground">Minutos</div>
        </div>
        <div className="bg-primary/10 rounded-lg p-2 md:p-4">
          <div className="text-lg md:text-2xl font-bold text-primary">{timeRemaining.seconds}</div>
          <div className="text-xs md:text-sm text-muted-foreground">Segundos</div>
        </div>
      </div>
    </div>
  )
}
