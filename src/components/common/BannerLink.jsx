import { Link } from 'react-router-dom'
import { isValidBannerLink } from '../../helpers/banner.js'

const BannerLink = ({ to, children, ...props }) => {
  const href = isValidBannerLink(to) ? to : '/products'
  if (/^https:\/\//i.test(href))
    return <a {...props} href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  return <Link {...props} to={href}>{children}</Link>
}

export default BannerLink
