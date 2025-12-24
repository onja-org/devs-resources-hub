import { AuthProvider } from '@/contexts/AuthContext';
import ResourceList from '@/components/ResourceList';
import Header from '@/components/Header';
import ProgressDashboard from '@/components/ProgressDashboard';
import StreakTracker from '@/components/StreakTracker';
import { InstallPrompt } from '@/components/InstallPrompt';
import { Suspense } from 'react';

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Dev Resources Hub',
    description: 'Curated collection of 265+ programming tutorials, web development courses, and developer tools for learning JavaScript, React, Python, Node.js, TypeScript and more',
    url: 'https://dev-resources.onja.org',
    logo: 'https://dev-resources.onja.org/favicon.svg',
    sameAs: [
      'https://twitter.com/onja_org',
      'https://github.com/onja-org',
      'https://onja.org'
    ],
    founder: {
      '@type': 'Organization',
      name: 'Onja',
      url: 'https://onja.org'
    },
    offers: {
      '@type': 'Offer',
      category: 'Education',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    educationalCredentialAwarded: 'Certificate of Completion',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Programming Learning Resources',
      itemListElement: [
        {
          '@type': 'Course',
          name: 'Web Development Resources',
          description: 'HTML, CSS, JavaScript, React, Vue, Angular tutorials and courses',
          provider: {
            '@type': 'Organization',
            name: 'Dev Resources Hub'
          }
        },
        {
          '@type': 'Course',
          name: 'Backend Development Resources',
          description: 'Node.js, Python, databases, API development tutorials',
          provider: {
            '@type': 'Organization',
            name: 'Dev Resources Hub'
          }
        },
        {
          '@type': 'Course',
          name: 'DevOps & Cloud Resources',
          description: 'Docker, Kubernetes, AWS, Azure, CI/CD tutorials',
          provider: {
            '@type': 'Organization',
            name: 'Dev Resources Hub'
          }
        }
      ]
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1'
    }
  };

  return (
    <AuthProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InstallPrompt />
      <Header />
      <StreakTracker />
      <ProgressDashboard />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-3">
              Developer Resources
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
              Discover, learn, and grow with curated resources
            </p>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <ResourceList />
          </Suspense>
        </main>
      </div>
    </AuthProvider>
  );
}
