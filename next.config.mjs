/** @type {import('next').NextConfig} */
const githubPages=process.env.GITHUB_PAGES_EXPORT==='1';
const basePath=githubPages?'/portfolio':'';
const nextConfig = {
  poweredByHeader:false,
  compress:true,
  ...(githubPages?{
    output:'export',
    outputFileTracingRoot:process.cwd(),
    basePath,
    assetPrefix:`${basePath}/`,
    trailingSlash:true,
    images:{unoptimized:true},
  }:{}),
};
export default nextConfig;
