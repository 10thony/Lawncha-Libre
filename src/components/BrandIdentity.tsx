const DEFAULT_BRAND_NAME = "Atheca";
const DEFAULT_TAGLINE = "Secure growth for modern contractors";
const DEFAULT_LOGO_SRC = "/atheca-logo-transparent.png";

type BrandIdentityProps = {
  className?: string;
  logoClassName?: string;
  nameClassName?: string;
  taglineClassName?: string;
  showTagline?: boolean;
  showName?: boolean;
  brandName?: string;
  tagline?: string;
  logoSrc?: string;
};

export function BrandIdentity({
  className = "",
  logoClassName = "h-10 w-10",
  nameClassName = "text-xl font-semibold text-primary",
  taglineClassName = "text-[10px] text-muted-foreground uppercase tracking-[0.15em]",
  showTagline = false,
  showName = true,
  brandName,
  tagline,
  logoSrc,
}: BrandIdentityProps) {
  const resolvedBrandName = brandName ?? DEFAULT_BRAND_NAME;
  const resolvedTagline = tagline ?? DEFAULT_TAGLINE;
  const resolvedLogoSrc = logoSrc ?? DEFAULT_LOGO_SRC;

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <img
        src={resolvedLogoSrc}
        alt={`${resolvedBrandName} logo`}
        className={`${logoClassName} object-contain drop-shadow-[0_0_16px_rgba(245,158,11,0.35)]`.trim()}
      />
      {(showName || showTagline) && (
        <div>
          {showName ? <h2 className={nameClassName}>{resolvedBrandName}</h2> : null}
          {showTagline && resolvedTagline ? (
            <p className={taglineClassName}>{resolvedTagline}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
