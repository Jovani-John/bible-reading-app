/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // إزالة swcMinify لأنه لم يعد مدعوماً في الإصدارات الحديثة
  experimental: {
    // إزالة reactCompiler من هنا
  },
  // إضافة reactCompiler في المستوى الأعلى
  reactCompiler: {
    compilationMode: 'annotation',
  },
  images: {
    domains: [],
  },
}

module.exports = nextConfig