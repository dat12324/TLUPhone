const StatCard = ({ icon: Icon, label, value, note, tone = 'rose' }) => {
  const toneClasses = {
    rose: 'bg-rose-50 text-primary',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-secondary">{value}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${toneClasses[tone]}`}>
          <Icon aria-hidden="true" />
        </span>
      </div>
      {note && <p className="mt-3 text-xs leading-5 text-slate-500">{note}</p>}
    </article>
  )
}

export default StatCard
