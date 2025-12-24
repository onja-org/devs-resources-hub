// SEO Component for enhanced meta tags
export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export function generateSEOMetadata({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  noindex = false,
}: SEOProps) {
  const baseUrl = 'https://dev-resources.onja.org';
  const defaultTitle = 'Dev Resources Hub - Free Programming Learning Platform | Tutorials, Courses & Tools';
  const defaultDescription = 'Discover 265+ curated developer resources including programming tutorials, web development courses, coding guides for JavaScript, React, Python, Node.js, TypeScript and more. Gamified learning with XP points and achievements.';
  
  const metaTitle = title ? `${title} | Dev Resources Hub` : defaultTitle;
  const metaDescription = description || defaultDescription;
  const metaKeywords = keywords || [];
  const metaCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;
  const metaImage = ogImage || `${baseUrl}/og-image.png`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    canonical: metaCanonical,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: metaCanonical,
      images: [{ url: metaImage }],
      type: 'website',
      siteName: 'Dev Resources Hub',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: '@onja_org',
    },
  };
}
