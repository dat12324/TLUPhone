import ProductSpecificationsDrawer from './ProductSpecificationsDrawer'
import { FiCheckCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi'

const ProductInformation = ({
  product, selectedVariant, isDescriptionExpanded, onToggleDescription,
  isSpecificationsOpen, onSpecsToggle,
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
        <ProductSpecificationsDrawer product={product} onClose={() => onSpecsToggle(false)} />
      )}

    </>
  )
}

export default ProductInformation
