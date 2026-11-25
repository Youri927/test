import type {MetadataRoute} from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || 'https://respray.fr';
  return {rules: [{userAgent: '*', allow: '/', disallow: ['/equipe', '/compte', '/vendre/envoyee', '/r/']}], sitemap: `${base}/sitemap.xml`};
}
