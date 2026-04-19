const ATHECA_LOGO_SRC = "/atheca-logo-transparent.png";

type BrandIdentityProps = {
  className?: string;
  logoClassName?: string;
  nameClassName?: string;
  taglineClassName?: string;
  showTagline?: boolean;
};

export function BrandIdentity({
  className = "",
  logoClassName = "h-10 w-10",
  nameClassName = "text-xl font-semibold gradient-text",
  taglineClassName = "text-xs text-gray-500 dark:text-gray-400",
  showTagline = false,
}: BrandIdentityProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <img
        src={ATHECA_LOGO_SRC}
        alt="Atheca logo"
        className={`${logoClassName} object-contain drop-shadow-[0_0_16px_rgba(34,211,238,0.35)]`.trim()}
      />
      <div>
        <h2 className={nameClassName}>Atheca</h2>
        {showTagline && (
          <p className={taglineClassName}>Secure growth for modern contractors</p>
        )}
      </div>
    </div>
  );
}
