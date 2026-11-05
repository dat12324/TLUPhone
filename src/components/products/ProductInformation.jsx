import { FiCheckCircle, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi'

const ProductInformation = ({
  product, selectedVariant, isDescriptionExpanded, onToggleDescription,
  isSpecificationsOpen, onSpecsToggle, modalCloseBtnRef,
}) => {
  const technical = product.technicalSpecs || {}
  const specificationSummary = [
    ['Màn hình', technical.screenSize ? `${technical.screenSize} inch` : ''],
    ['Camera chính', technical.cameraMainMp ? `${technical.cameraMainMp} MP` : ''],
    ['Màu sắc', technical.colors],
    ['Chipset', technical.chip],
    ['Hãng chip', technical.chipBrand],
    ['Hệ điều hành', technical.operatingSystem],
    ['RAM', selectedVariant?.ram],
    ['Bộ nhớ trong (ROM)', selectedVariant?.storage],
    ['Dung lượng pin', technical.batteryCapacity ? `${technical.batteryCapacity} mAh` : ''],
    ['Tần số quét', technical.refreshRate ? `${technical.refreshRate} Hz` : ''],
    ['Mạng', technical.network],
    ['Sạc không dây', technical.wirelessCharging == null ? '' : technical.wirelessCharging ? 'Có' : 'Không'],
  ].filter(([, value]) => value != null && value !== '')
  const hasDetailedSpecifications = Object.keys(product.specifications || {}).length > 0

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-secondary mb-4 pb-2 border-b border-gray-100">
              Đặc điểm nổi bật
            </h2>
            {product.highlights && product.highlights.length > 0 && (
              <div className="space-y-2.5 mb-6">
                {product.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-gray-700 bg-rose-50/40 p-3 rounded-xl border border-rose-100/60"
                  >
                    <FiCheckCircle className="text-primary text-base mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
            {product.description && (
              <div>
                <h3 className="text-base font-semibold text-secondary mb-3">
                  Đánh giá chi tiết {product.name}
                </h3>
                <div
                  className={`relative text-sm text-gray-600 leading-relaxed space-y-3 transition-all ${!isDescriptionExpanded ? 'max-h-48 overflow-hidden' : ''
                    }`}
                >
                  {product.description.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}

                  {!isDescriptionExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  )}
                </div>
                <div className="text-center mt-4 pt-2">
                  <button
                    type="button"
                    onClick={onToggleDescription}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-rose-700 transition-colors"
                  >
                    {isDescriptionExpanded ? (
                      <>
                        Thu gọn nội dung <FiChevronUp />
                      </>
                    ) : (
                      <>
                        Xem thêm bài viết <FiChevronDown />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-secondary mb-4 pb-2 border-b border-gray-100">
              Thông số kỹ thuật
            </h2>

            {specificationSummary.length > 0 ? (
              <div className="divide-y divide-gray-100 text-sm">
                {specificationSummary.map(([specKey, specValue]) => (
                  <div key={specKey} className="grid min-w-0 grid-cols-1 gap-1 py-3 sm:grid-cols-12 sm:gap-3">
                    <span className="min-w-0 text-gray-500 sm:col-span-5">{specKey}:</span>
                    <span className="min-w-0 whitespace-pre-line text-gray-600 [overflow-wrap:anywhere] sm:col-span-7">
                      {specValue}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Đang cập nhật thông số kỹ thuật...</p>
            )}
            {hasDetailedSpecifications && (
              <button
                type="button"
                onClick={() => onSpecsToggle(true)}
                className="mt-4 w-full rounded-xl border border-primary/30 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:border-primary hover:bg-rose-50 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
              >
                Xem cấu hình chi tiết
              </button>
            )}
          </div>
        </div>
      </div>
      {isSpecificationsOpen && hasDetailedSpecifications && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => onSpecsToggle(false)}
          role="presentation"
        >
          <div
            className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="spec-modal-title"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5 bg-white shrink-0">
              <div>
                <h2 id="spec-modal-title" className="text-lg sm:text-xl font-bold text-secondary flex items-center gap-2">
                  Thông số kỹ thuật chi tiết
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {product.name}
                  {selectedVariant?.ram && selectedVariant?.storage
                    ? ` • ${selectedVariant.ram} / ${selectedVariant.storage}`
                    : ''}
                </p>
              </div>
              <button
                type="button"
                ref={modalCloseBtnRef}
                onClick={() => onSpecsToggle(false)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Đóng thông số kỹ thuật"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
              {Object.entries(product.specifications).map(([key, group]) => (
                <section key={key} className="rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                  <div className="bg-rose-50/60 px-4 py-2.5 border-b border-rose-100/60 flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-primary rounded-full inline-block" />
                    <h3 className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider">
                      {group.title}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100 text-sm">
                    {Object.entries(group.items || {}).map(([specKey, specValue], rowIndex) => (
                      <div
                        key={specKey}
                        className={`grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 px-4 py-3 transition-colors ${
                          rowIndex % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'
                        }`}
                      >
                        <span className="font-medium text-gray-500 sm:col-span-4 text-xs sm:text-sm">
                          {specKey}
                        </span>
                        <span className="min-w-0 whitespace-pre-line text-xs leading-relaxed text-secondary [overflow-wrap:anywhere] sm:col-span-8 sm:text-sm">
                          {specValue}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <div className="border-t border-gray-100 px-5 py-3 sm:px-6 bg-gray-50/70 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => onSpecsToggle(false)}
                className="rounded-xl bg-gray-200 hover:bg-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

export default ProductInformation
