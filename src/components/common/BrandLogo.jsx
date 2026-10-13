import brand from '../../config/brand'

const sizeClasses = {
  sm: {
    mark: 'h-9 w-9 rounded-lg',
    text: 'text-lg',
    image: 'h-9',
    gap: 'gap-2',
  },
  md: {
    mark: 'h-10 w-10 rounded-xl',
    text: 'text-xl',
    image: 'h-10',
    gap: 'gap-2.5',
  },
  lg: {
    mark: 'h-11 w-11 rounded-xl',
    text: 'text-2xl',
    image: 'h-11',
    gap: 'gap-3',
  },
}

const BrandLogo = ({
  variant = 'light',
  size = 'md',
  compact = false,
  responsive = false,
  className = '',
}) => {
  const styles = sizeClasses[size] || sizeClasses.md
  const fullLogo = variant === 'dark'
    ? brand.logo.dark || brand.logo.light
    : brand.logo.light

  if (fullLogo) {
    return (
      <img
        src={fullLogo}
        alt={brand.name}
        className={`${styles.image} w-auto object-contain ${className}`}
      />
    )
  }

  const textColor = variant === 'dark' ? 'text-white' : 'text-secondary'

  return (
    <span
      role="img"
      aria-label={brand.name}
      className={`inline-flex shrink-0 items-center ${styles.gap} ${className}`}
    >
      <img
        src={brand.logo.mark}
        alt=""
        aria-hidden="true"
        className={`${styles.mark} shrink-0`}
      />
      {!compact && (
        <span className={`${responsive ? 'hidden sm:block' : 'block'} ${styles.text} font-extrabold tracking-tight ${textColor}`}>
          {brand.namePrefix}<span className="text-primary">{brand.nameAccent}</span>
        </span>
      )}
    </span>
  )
}

export default BrandLogo
