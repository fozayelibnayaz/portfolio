/** Prefix a public asset path for a repository subpath deployment such as /portfolio. */
export function siteAsset(pathname:string) {
  if(!pathname || !pathname.startsWith('/') || pathname.startsWith('//')) return pathname;
  const base=process.env.NEXT_PUBLIC_BASE_PATH||'';
  return base && pathname!==base && !pathname.startsWith(`${base}/`) ? `${base}${pathname}` : pathname;
}

export function siteSrcSet(value:string) {
  return value.split(',').map(candidate=>{
    const [url,...descriptor]=candidate.trim().split(/\s+/);
    return `${siteAsset(url)}${descriptor.length?` ${descriptor.join(' ')}`:''}`;
  }).join(', ');
}
