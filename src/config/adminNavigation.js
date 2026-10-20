import {
  FiBarChart2,
  FiBox,
  FiCpu,
  FiGrid,
  FiImage,
  FiLayers,
  FiPackage,
  FiShoppingBag,
  FiTag,
  FiUsers,
  FiZap,
} from 'react-icons/fi'

export const adminNavigation = [
  {
    label: 'Tổng quan',
    items: [
      { path: '/admin/dashboard', segment: 'dashboard', label: 'Dashboard', title: 'Tổng quan', icon: FiGrid },
    ],
  },
  {
    label: 'Quản lý bán hàng',
    items: [
      { path: '/admin/orders', segment: 'orders', label: 'Đơn hàng', title: 'Quản lý đơn hàng', icon: FiShoppingBag },
      { path: '/admin/products', segment: 'products', label: 'Sản phẩm', title: 'Quản lý sản phẩm', icon: FiPackage },
      { path: '/admin/categories', segment: 'categories', label: 'Danh mục', title: 'Quản lý danh mục', icon: FiLayers },
      { path: '/admin/brands', segment: 'brands', label: 'Thương hiệu', title: 'Quản lý thương hiệu', icon: FiBox },
      { path: '/admin/customers', segment: 'customers', label: 'Khách hàng', title: 'Quản lý khách hàng', icon: FiUsers },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { path: '/admin/flash-sales', segment: 'flash-sales', label: 'Flash Sale', title: 'Quản lý Flash Sale', icon: FiZap },
      { path: '/admin/vouchers', segment: 'vouchers', label: 'Voucher', title: 'Quản lý voucher', icon: FiTag },
      { path: '/admin/banners', segment: 'banners', label: 'Banner', title: 'Quản lý banner', icon: FiImage },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { path: '/admin/ai-data', segment: 'ai-data', label: 'Dữ liệu AI', title: 'Dữ liệu AI', icon: FiCpu },
      { path: '/admin/reports', segment: 'reports', label: 'Báo cáo thống kê', title: 'Báo cáo thống kê', icon: FiBarChart2 },
    ],
  },
]

export const adminPages = adminNavigation.flatMap((group) => group.items)

export const findAdminPage = (pathname) =>
  adminPages.find((item) => item.path === pathname) || adminPages[0]
