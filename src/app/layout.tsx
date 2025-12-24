import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { UserProgressProvider } from "@/contexts/UserProgressContext";
import { PWAInstaller } from "@/components/PWAInstaller";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Developer Resources - Free Programming Tutorials & Courses from the internet | Learn Web Development",
    template: "%s | Dev Resources Hub"
  },
  description: "Discover many curated programming resources: best coding tutorials, web development courses, JavaScript frameworks, React guides, Python learning paths, Node.js documentation, TypeScript examples, Git workflows, API references, software design patterns, algorithms, data structures, DevOps guides, cloud computing tutorials, database tutorials, mobile development, frontend frameworks, backend technologies, coding bootcamp resources, developer training, software engineering best practices, coding challenges, technical interview preparation, LeetCode solutions, tech blogs, developer communities, open source contribution guides, career development resources, and freelancing tips. Free learning platform, progress tracking, achievements, skill levels, and recommendations for developers worldwide.",
  keywords: [
    // Onja & Madagascar - Primary focus
    "Onja", "Onja Madagascar", "Onja developers", "Madagascar tech", "Madagascar developers",
    "African tech education", "coding bootcamp Madagascar", "developer training Madagascar",
    "Onja resources", "Onja learning platform", "learn coding Madagascar", "tech talent Africa",
    "Onja alumni", "Madagascar programmers", "African developers", "coding education Africa",
    "tech hub Madagascar", "software development Africa", "web developers Madagascar",
    
    // Best/Great Resources - Search intent
    "best programming tutorials", "best coding resources", "great programming courses",
    "top developer resources", "best web development tutorials", "great coding bootcamps",
    "best JavaScript tutorials", "top React resources", "best Python courses",
    "greatest coding tutorials", "excellent programming guides", "top-rated coding resources",
    "best developer learning platform", "top programming education", "great tech tutorials",
    
    // Tutorial-focused
    "programming tutorials", "coding tutorials", "web development tutorials", 
    "step-by-step coding guides", "beginner programming tutorials", "advanced coding tutorials",
    "interactive coding lessons", "video programming tutorials", "free coding courses",
    "hands-on programming practice", "tutorial collection", "learning resources developers",
    
    // Technologies - With tutorial/resource context
    "JavaScript tutorials", "React tutorial", "Python learning resources", "TypeScript guide",
    "Node.js tutorials", "Vue.js resources", "Angular tutorials", "Django guide",
    "Express.js tutorials", "Next.js learning", "Svelte framework tutorial",
    "Tailwind CSS guide", "Bootstrap tutorials", "MongoDB tutorial", "PostgreSQL guide",
    
    // General Programming
    "learn to code", "software development tutorials", "programming courses",
    "developer education", "tech learning hub", "programming guides",
    "coding bootcamp resources", "self-taught developer", "learn programming online",
    
    // Languages
    "Java programming", "C++ resources", "Ruby tutorials", "PHP development",
    "Go programming", "Rust learning", "Kotlin development", "Swift tutorials",
    
    // Frontend Development
    "frontend development", "HTML CSS JavaScript", "responsive web design",
    "UI/UX resources", "web components", "CSS frameworks", "modern JavaScript",
    "frontend frameworks", "web development guide", "client-side programming",
    
    // Backend Development  
    "backend development", "API development", "REST API tutorials", "GraphQL guide",
    "microservices", "server-side programming", "Flask tutorials", "Spring Boot",
    "Laravel PHP", "backend frameworks", "server development",
    
    // Database
    "SQL tutorials", "database design", "NoSQL databases", "Redis guide",
    "database management", "ORM tutorials", "Prisma guide", "MySQL resources",
    
    // DevOps & Cloud
    "DevOps tutorials", "Docker guide", "Kubernetes learning", "CI/CD pipelines",
    "AWS tutorials", "Azure cloud", "Google Cloud Platform", "cloud computing",
    "Terraform guide", "Jenkins tutorials", "containerization", "cloud deployment",
    
    // Tools & Best Practices
    "Git tutorials", "GitHub guide", "version control", "code review best practices",
    "testing frameworks", "Jest tutorials", "unit testing", "TDD BDD",
    "debugging techniques", "clean code", "design patterns", "SOLID principles",
    "software architecture", "code quality", "best coding practices",
    
    // Mobile & Desktop
    "mobile app development", "React Native tutorials", "Flutter guide",
    "iOS development", "Android programming", "cross-platform apps",
    
    // Career & Interview Prep
    "coding interview prep", "algorithm tutorials", "data structures tutorial",
    "technical interview questions", "LeetCode solutions", "system design interview",
    "developer career", "portfolio tips", "resume for developers", "job search tech",
    "freelance developer", "remote developer jobs", "tech career Madagascar",
    
    // Community & Learning
    "developer community", "tech blogs", "programming resources", "code examples",
    "developer tools", "VS Code tutorials", "productivity for developers",
    "open source projects", "contribute to open source", "coding mentorship",
    
    // Concepts & Skills
    "object-oriented programming", "functional programming", "async programming",
    "web security tutorials", "authentication guide", "performance optimization",
    "accessibility web development", "SEO for developers", "progressive web apps",
    "state management", "API design", "software testing",
    
    // Gamification & Learning Features
    "gamified learning", "progress tracking", "XP achievements", "coding challenges",
    "developer leveling system", "learn by doing", "interactive coding",
    "personalized learning path", "skill-based learning", "achievement system"
  ],
  authors: [{ name: "Onja", url: "https://onja.org" }],
  creator: "Onja Madagascar",
  publisher: "Onja",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://resources.onja.org",
    siteName: "Dev Resources Hub",
    title: "Dev Resources - Best Programming resources like articles, tutorials, courses and more",
    description: "Explore curated programming tutorials and web development resources from the internet. Learn JavaScript, React, Python, Node.js with the best coding tutorials, courses, and guides.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dev Resources Hub - Learn Programming & Web Development",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dev Resources Hub - Free Programming Learning Platform",
    description: "265+ curated developer resources: tutorials, courses, tools & guides for JavaScript, React, Python, Node.js & more. Gamified learning with XP & achievements.",
    images: ["/og-image.png"],
    creator: "@onja_org",
  },
  alternates: {
    canonical: "https://resources.onja.dev",
  },
  category: "technology",
  classification: "Education",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' }
    ],
  },
  manifest: "/manifest.json",
  applicationName: "Onja Developer Resources",
  appleWebApp: {
    capable: true,
    title: "Onja Resources",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: "google-site-verification-code", // Replace with actual code
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://resources.onja.dev/#organization",
        "name": "Onja",
        "url": "https://onja.org",
        "logo": {
          "@type": "ImageObject",
          "url": "https://resources.onja.dev/logo.png"
        },
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "Madagascar",
          "addressLocality": "Toamasina"
        },
        "description": "Onja is a social enterprise training underprivileged youth into world-class software developers.",
        "sameAs": [
          "https://github.com/onja-org",
          "https://twitter.com/onja_org",
          "https://www.linkedin.com/company/onja-madagascar"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://resources.onja.dev/#website",
        "url": "https://resources.onja.dev",
        "name": "Onja Developer Resources",
        "description": "Curated programming tutorials and web development resources from Madagascar",
        "publisher": {
          "@id": "https://resources.onja.dev/#organization"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "Course",
        "name": "Free Programming & Web Development Resources",
        "description": "Comprehensive collection of 265+ curated programming tutorials, web development courses, and coding resources covering JavaScript, React, Python, Node.js, TypeScript, and more.",
        "provider": {
          "@id": "https://resources.onja.dev/#organization"
        },
        "educationalLevel": "All Levels",
        "inLanguage": "en-US",
        "availableLanguage": "en",
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": "online",
          "courseWorkload": "PT1H"
        },
        "audience": {
          "@type": "EducationalAudience",
          "educationalRole": "student"
        }
      },
      {
        "@type": "ItemList",
        "name": "Programming Tutorial Categories",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "JavaScript Tutorials"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "React Resources"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Python Learning"
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "Node.js Tutorials"
          },
          {
            "@type": "ListItem",
            "position": 5,
            "name": "TypeScript Guides"
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://resources.onja.dev"
          }
        ]
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PWAInstaller />
        <ToastProvider>
          <UserProgressProvider>
            {children}
          </UserProgressProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
