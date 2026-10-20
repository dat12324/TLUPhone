import { useId, useState } from 'react'
import { formatCompactVnd, formatVnd } from '../../../utils/adminFormatters'

const CHART_WIDTH = 760
const CHART_HEIGHT = 280
const MARGIN = { top: 18, right: 18, bottom: 42, left: 58 }

const RevenueChart = ({ data, periodLabel }) => {
  const titleId = useId()
  const [activeIndex, setActiveIndex] = useState(null)
  const plotWidth = CHART_WIDTH - MARGIN.left - MARGIN.right
  const plotHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1)
  const roundedMax = Math.ceil(maxRevenue / 10_000_000) * 10_000_000 || 10_000_000
  const getX = (index) => data.length === 1
    ? MARGIN.left + plotWidth / 2
    : MARGIN.left + (index / (data.length - 1)) * plotWidth
  const getY = (value) => MARGIN.top + plotHeight - (value / roundedMax) * plotHeight
  const points = data.map((item, index) => `${getX(index)},${getY(item.revenue)}`).join(' ')
  const labelStep = data.length > 14 ? 5 : data.length > 7 ? 2 : 1
  const activePoint = activeIndex === null ? null : data[activeIndex]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby={titleId}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={titleId} className="text-lg font-bold text-secondary">Doanh thu</h2>
          <p className="mt-1 text-sm text-slate-500">Đơn hoàn thành · {periodLabel}</p>
        </div>
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">VNĐ</span>
      </div>

      {data.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center text-sm text-slate-500">Chưa có dữ liệu doanh thu.</div>
      ) : (
        <div className="relative w-full overflow-x-auto">
          <svg
            className="min-w-[620px]"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            role="img"
            aria-labelledby={`${titleId}-chart-title ${titleId}-chart-desc`}
          >
            <title id={`${titleId}-chart-title`}>Biểu đồ doanh thu {periodLabel}</title>
            <desc id={`${titleId}-chart-desc`}>Doanh thu chỉ tính các đơn hàng đã hoàn thành.</desc>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = MARGIN.top + plotHeight - ratio * plotHeight
              const value = roundedMax * ratio
              return (
                <g key={ratio}>
                  <line x1={MARGIN.left} x2={CHART_WIDTH - MARGIN.right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <text x={MARGIN.left - 10} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
                    {formatCompactVnd(value)}
                  </text>
                </g>
              )
            })}
            <polyline points={points} fill="none" stroke="#e11d48" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            {data.map((item, index) => {
              const showLabel = index % labelStep === 0 || index === data.length - 1
              return (
                <g key={item.date}>
                  {showLabel && (
                    <text x={getX(index)} y={CHART_HEIGHT - 14} textAnchor="middle" className="fill-slate-500 text-[10px]">
                      {item.label}
                    </text>
                  )}
                  <circle
                    cx={getX(index)}
                    cy={getY(item.revenue)}
                    r={activeIndex === index ? 6 : 4}
                    fill={item.revenue > 0 ? '#e11d48' : '#ffffff'}
                    stroke="#e11d48"
                    strokeWidth="2"
                    tabIndex="0"
                    role="img"
                    aria-label={`${item.label}: ${formatVnd(item.revenue)}`}
                    className="cursor-pointer outline-none focus:stroke-[4]"
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onFocus={() => setActiveIndex(index)}
                    onBlur={() => setActiveIndex(null)}
                  />
                </g>
              )
            })}
          </svg>

          {activePoint && (
            <div
              className="pointer-events-none absolute top-2 z-10 rounded-lg bg-secondary px-3 py-2 text-xs text-white shadow-lg"
              style={{ left: `${Math.min(82, Math.max(8, (getX(activeIndex) / CHART_WIDTH) * 100))}%` }}
            >
              <span className="block text-slate-300">{activePoint.label}</span>
              <strong className="mt-0.5 block whitespace-nowrap">{formatVnd(activePoint.revenue)}</strong>
            </div>
          )}

          <table className="sr-only">
            <caption>Dữ liệu doanh thu {periodLabel}</caption>
            <thead><tr><th>Ngày</th><th>Doanh thu</th></tr></thead>
            <tbody>
              {data.map((item) => <tr key={item.date}><td>{item.label}</td><td>{formatVnd(item.revenue)}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default RevenueChart
