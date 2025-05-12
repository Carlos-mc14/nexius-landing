/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // Dominio principal de tu web
  siteUrl: process.env.NEXTAUTH_URL || 'https://nexius.lat',

  // Opciones de sitemap
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,       // Máximo de URLs por archivo
  generateIndexSitemap: true,

  // Excluye rutas que no quieras indexar
  exclude: [
    '/admin/*',
    '/login',
    '/register',
  ],

  // Generación automática de robots.txt
  generateRobotsTxt: true,

  // Opciones extra para robots.txt
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin', '/api/*'] },
    ],
    // Añade sitemaps adicionales si manejas multi-sitemaps
    //additionalSitemaps: [
    //  'https://nexius.lat/server-sitemap-index.xml',
    //],
  },
};
