// Mock data cho Banner và Dịch vụ trên HomePage
// Thiết kế chuẩn Schema để sau này quản lý từ Admin Backend API

// Schema dữ liệu mà API Admin cần trả về cho khu vực khuyến mãi trang chủ.
export const homePromotion = {
  id: 'home-hot-deals',
  title: 'Khuyến Mãi Hấp Dẫn',
  description: 'Ưu đãi có thời hạn trong 2 ngày',
  status: 'active',
  startsAt: '2026-10-13T12:32:36+07:00',
  endsAt: '2026-10-15T12:32:36+07:00',
  products: [
    { productId: 1, price: 34990000, originalPrice: 39990000 },
    { productId: 2, price: 22990000, originalPrice: 24990000 },
    { productId: 3, price: 31990000, originalPrice: 36990000 },
    { productId: 4, price: 19990000, originalPrice: 22990000 },
    { productId: 5, price: 9490000, originalPrice: 10990000 },
  ],
}

export const heroBanners = [
  {
    id: 1,
    title: 'iPhone 15 Pro Max',
    subtitle: 'Khung viền Titan hàng không vũ trụ • Chip A17 Pro đỉnh cao',
    tag: 'SIÊU PHẨM MỚI',
    priceText: 'Chỉ từ 34.990.000₫',
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png',
    link: '/products/1',
    bgColor: 'from-slate-900 via-slate-800 to-rose-950',
    btnText: 'Khám phá ngay',
  },
  {
    id: 2,
    title: 'Galaxy S24 Ultra',
    subtitle: 'Quyền năng Galaxy AI • Camera 200MP zoom siêu rõ nét',
    tag: 'GALAXY AI ĐỘT PHÁ',
    priceText: 'Chỉ từ 31.990.000₫',
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-s24-ultra_-1_1.png',
    link: '/products/3',
    bgColor: 'from-slate-950 via-zinc-900 to-blue-950',
    btnText: 'Mua ngay',
  },
  {
    id: 3,
    title: 'Xiaomi 14 Ultra',
    subtitle: 'Hệ thống 4 camera Leica 1-inch • Snapdragon 8 Gen 3',
    tag: 'TUYỆT TÁC NHIẾP ẢNH',
    priceText: 'Chỉ từ 23.990.000₫',
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-14-ultra_1__1.png',
    link: '/products/6',
    bgColor: 'from-zinc-900 via-stone-900 to-amber-950',
    btnText: 'Xem chi tiết',
  },
  {
    id: 4,
    title: 'Galaxy Z Flip 5',
    subtitle: 'Gập mở linh hoạt • Màn hình Flex Window 3.4 inch độc đáo',
    tag: 'GIẢM ĐẾN 23%',
    priceText: 'Chỉ từ 19.990.000₫',
    image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-z-flip-5-256gb_1.png',
    link: '/products/11',
    bgColor: 'from-purple-950 via-slate-900 to-rose-950',
    btnText: 'Săn deal sốc',
  },
]

// Danh sách các hãng điện thoại nổi bật
export const homeBrands = [
  {
    id: 'apple',
    name: 'Apple',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    description: 'iPhone chính hãng VN/A',
  },
  {
    id: 'samsung',
    name: 'Samsung',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    description: 'Galaxy AI & Gập mở',
  },
  {
    id: 'xiaomi',
    name: 'Xiaomi',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg',
    description: 'Cấu hình khủng giá tốt',
  },
  {
    id: 'oppo',
    name: 'OPPO',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/OPPO_Logo_wiki.png',
    description: 'Chuyên gia chân dung',
  },
  {
    id: 'vivo',
    name: 'vivo',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Vivo_mobile_logo.png',
    description: 'Nhiếp ảnh ZEISS',
  },
  {
    id: 'realme',
    name: 'realme',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Realme_logo.png',
    description: 'Dẫn đầu xu hướng trẻ',
  },
]

// Banner khuyến mãi phụ (giữa các section)
export const promoBanners = [
  {
    id: 'student-deal',
    title: 'Tìm điện thoại phù hợp',
    subtitle: 'Lọc theo thương hiệu, mức giá, bộ nhớ và nhu cầu sử dụng',
    tag: 'DỄ CHỌN, DỄ SO SÁNH',
    link: '/products',
    tone: 'rose',
    icon: 'phone',
  },
  {
    id: 'trade-in',
    title: 'Nhiều thương hiệu điện thoại',
    subtitle: 'Khám phá Apple, Samsung, Xiaomi, OPPO, vivo và realme',
    tag: 'NHIỀU LỰA CHỌN',
    link: '/products',
    tone: 'slate',
    icon: 'brands',
  },
  {
    id: 'free-ship',
    title: 'Miễn phí vận chuyển',
    subtitle: 'Áp dụng cho đơn hàng từ 500K',
    tag: 'ĐƠN TỪ 500K',
    link: '/products',
    tone: 'emerald',
    icon: 'shipping',
  },
]

// Cam kết dịch vụ
export const serviceCommitments = [
  {
    id: 1,
    title: 'Chuyên điện thoại',
    description: 'Tập trung vào các dòng smartphone',
  },
  {
    id: 2,
    title: 'Thông tin rõ ràng',
    description: 'Giá bán và cấu hình minh bạch',
  },
  {
    id: 3,
    title: 'Miễn phí vận chuyển',
    description: 'Áp dụng cho đơn hàng từ 500K',
  },
  {
    id: 4,
    title: 'Hỗ trợ mua hàng',
    description: 'Hotline 1900 1234',
  },
]

// Banner dùng cho trang sản phẩm
export const productBrands = [
  { name: 'Apple', logo: 'iPhone' }, { name: 'Samsung', logo: 'SAMSUNG' },
  { name: 'OPPO', logo: 'oppo' }, { name: 'Xiaomi', logo: 'Xiaomi' },
  { name: 'TECNO', logo: 'TECNO' }, { name: 'HONOR', logo: 'HONOR' },
  { name: 'Nokia', logo: 'NOKIA' }, { name: 'realme', logo: 'realme' },
  { name: 'vivo', logo: 'vivo' }, { name: 'OnePlus', logo: 'ONEPLUS' },
]

export const iphoneBanners = [
  { title: 'iPhone 15 Pro Max', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:600:600/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png', link: '/products/1' },
  { title: 'iPhone 15', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:600:600/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-plus_1_.png', link: '/products/2' },
]

export const androidBanners = [
  { title: 'Xiaomi 14 Ultra', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-14-ultra_1__1.png', link: '/products/6' },
  { title: 'Galaxy S24 Ultra', image: 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-s24-ultra_-1_1.png', link: '/products/3' },
]
