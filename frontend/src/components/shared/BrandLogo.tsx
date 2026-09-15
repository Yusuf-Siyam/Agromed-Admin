import logo64 from '@/assets/brand/logo-64.png';

const BRAND_DARK_GREEN = '#004B23';

interface BrandLogoProps {

  className?: string;
  title?: string;
}

export default function BrandLogo({ className = 'h-8 w-8', title = 'AgroMedConnect' }: BrandLogoProps) {
  return (
    <span
      role="img"
      aria-label={title}
      style={{ backgroundColor: BRAND_DARK_GREEN }}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-lg ${className}`}
    >
      <img
        src={logo64}
        alt=""
        aria-hidden
        width={64}
        height={64}
        draggable={false}
        className="h-[72%] w-[72%] object-contain"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
    </span>
  );
}
