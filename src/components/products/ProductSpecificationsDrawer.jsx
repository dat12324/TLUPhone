import { useRef, useState } from 'react'
import SideDrawer from '../common/SideDrawer'

const ProductSpecificationsDrawer = ({ product, onClose }) => {
  const groups = Object.entries(product.specifications || {})
  const [active, setActive] = useState(0)
  const content = useRef(null)
  const sections = useRef([])

  const goToGroup = index => {
    const section = sections.current[index]
    if (!section || !content.current) return
    setActive(index)
    content.current.scrollTo({
      top: section.offsetTop - 16,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  const trackGroup = () => {
    const position = content.current.scrollTop + 32
    let index = 0
    sections.current.forEach((section, current) => {
      if (section && section.offsetTop <= position) index = current
    })
    setActive(index)
  }

  return <SideDrawer title="Thông số kỹ thuật" onClose={onClose} className="!max-w-3xl">
    <nav aria-label="Nhóm thông số kỹ thuật" className="flex shrink-0 overflow-x-auto border-b border-slate-200 px-3 sm:px-6">
      {groups.map(([key, group], index) => <button key={key} type="button" onClick={() => goToGroup(index)}
        aria-current={active === index ? 'location' : undefined}
        className={`min-h-14 shrink-0 border-b-2 px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${active === index ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-secondary'}`}>
        {group.title}
      </button>)}
    </nav>
    <div ref={content} onScroll={trackGroup} className="relative min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
      <p className="text-sm text-slate-500">{product.name}</p>
      {groups.map(([key, group], index) => <section key={key} ref={node => { sections.current[index] = node }} aria-labelledby={`specification-group-${index}`}>
        <h3 id={`specification-group-${index}`} className="mb-2 text-base font-semibold text-secondary">{group.title}</h3>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <caption className="sr-only">{group.title} — {product.name}</caption>
            <tbody>{Object.entries(group.items || {}).map(([label, value]) => <tr key={label} className="border-b border-slate-200 last:border-b-0">
              <th scope="row" className="w-[38%] border-r border-slate-200 bg-slate-50 px-3 py-3 align-top font-normal leading-6 text-slate-600 [overflow-wrap:anywhere] sm:w-[30%] sm:px-4">{label}</th>
              <td className="whitespace-pre-line px-3 py-3 align-top leading-6 text-secondary [overflow-wrap:anywhere] sm:px-4">{value}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>)}
    </div>
  </SideDrawer>
}

export default ProductSpecificationsDrawer
