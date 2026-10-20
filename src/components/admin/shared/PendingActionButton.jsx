const PendingActionButton = ({ label, children }) => (
  <button
    type="button"
    disabled
    className="flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-lg text-slate-300"
    aria-label={`${label} — chưa khả dụng`}
    title={`${label} — sẽ triển khai ở bước sau`}
  >
    {children}
  </button>
)

export default PendingActionButton

