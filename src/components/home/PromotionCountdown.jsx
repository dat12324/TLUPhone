import { useEffect, useMemo, useState } from 'react'
import { FiClock } from 'react-icons/fi'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const getRemainingTime = (endsAt) => {
  const endTime = new Date(endsAt).getTime()

  if (!Number.isFinite(endTime)) return null

  const remaining = Math.max(0, endTime - Date.now())

  return {
    total: remaining,
    days: Math.floor(remaining / DAY),
    hours: Math.floor((remaining % DAY) / HOUR),
    minutes: Math.floor((remaining % HOUR) / MINUTE),
    seconds: Math.floor((remaining % MINUTE) / SECOND),
  }
}

const TimeUnit = ({ value, label }) => (
  <div className="min-w-11 rounded-lg border border-white/25 bg-white px-2 py-1.5 text-center text-secondary sm:min-w-12">
    <span className="block text-base font-extrabold leading-none tabular-nums sm:text-lg">
      {String(value).padStart(2, '0')}
    </span>
    <span className="mt-1 block text-[9px] font-bold uppercase tracking-wide text-slate-500">
      {label}
    </span>
  </div>
)

/**
 * API-ready promotion shape:
 * {
 *   status: 'active',
 *   startsAt: '2026-10-13T00:00:00+07:00',
 *   endsAt: '2026-10-20T23:59:59+07:00'
 * }
 */
const PromotionCountdown = ({ promotion }) => {
  const endsAt = promotion?.endsAt
  const startsAt = promotion?.startsAt
  const isActive = promotion?.status === 'active'
  const startTime = useMemo(() => new Date(startsAt).getTime(), [startsAt])
  const [remaining, setRemaining] = useState(() => getRemainingTime(endsAt))

  useEffect(() => {
    setRemaining(getRemainingTime(endsAt))

    if (!isActive || !endsAt) return undefined

    const intervalId = window.setInterval(() => {
      const nextRemaining = getRemainingTime(endsAt)
      setRemaining(nextRemaining)

      if (!nextRemaining || nextRemaining.total === 0) {
        window.clearInterval(intervalId)
      }
    }, SECOND)

    return () => window.clearInterval(intervalId)
  }, [endsAt, isActive])

  const hasStarted = !Number.isFinite(startTime) || startTime <= Date.now()

  if (!isActive || !endsAt || !remaining || !hasStarted) return null

  if (remaining.total === 0) {
    return (
      <div className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
        <FiClock aria-hidden="true" />
        Chương trình đã kết thúc
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90 sm:mr-1 sm:text-sm">
        <FiClock aria-hidden="true" />
        Kết thúc sau
      </div>
      <div
        className="flex items-center gap-1.5"
        role="timer"
        aria-live="off"
        aria-label={`Còn ${remaining.days} ngày, ${remaining.hours} giờ, ${remaining.minutes} phút, ${remaining.seconds} giây`}
      >
        <TimeUnit value={remaining.days} label="Ngày" />
        <span aria-hidden="true" className="font-bold text-white/70">:</span>
        <TimeUnit value={remaining.hours} label="Giờ" />
        <span aria-hidden="true" className="font-bold text-white/70">:</span>
        <TimeUnit value={remaining.minutes} label="Phút" />
        <span aria-hidden="true" className="font-bold text-white/70">:</span>
        <TimeUnit value={remaining.seconds} label="Giây" />
      </div>
    </div>
  )
}

export default PromotionCountdown
