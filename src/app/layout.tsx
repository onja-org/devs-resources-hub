import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { UserProgressProvider } from "@/contexts/UserProgressContext";

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
    default: "Dev Resources Hub - Free Programming Learning Platform | Tutorials, Courses & Tools",
    template: "%s | Dev Resources Hub"
  },
  description: "Discover 265+ curated developer resources: programming tutorials, web development courses, coding bootcamps, JavaScript frameworks, React guides, Python learning, Node.js documentation, TypeScript examples, Git tutorials, API references, design patterns, algorithms, data structures, DevOps tools, cloud computing, database management, mobile development, frontend frameworks, backend technologies, software engineering best practices, coding challenges, interview preparation, tech blogs, developer communities, open source projects, and career resources. Free learning platform with gamification, progress tracking, XP points, achievements, and personalized recommendations for developers of all skill levels.",
  keywords: [
    // General Programming
    "programming tutorials", "coding resources", "learn to code", "developer learning platform",
    "software development tutorials", "programming courses", "free coding resources",
    "developer education", "tech learning hub", "programming guides",
    
    // Languages
    "JavaScript tutorials", "Python learning", "TypeScript guide", "Java programming",
    "C++ resources", "Ruby tutorials", "PHP development", "Go programming",
    "Rust learning", "Kotlin development", "Swift tutorials", "Scala resources",
    
    // Frontend
    "React tutorials", "Vue.js guide", "Angular learning", "frontend development",
    "HTML CSS JavaScript", "responsive web design", "UI/UX resources",
    "Svelte framework", "Next.js tutorials", "web components", "CSS frameworks",
    "Tailwind CSS", "Bootstrap guide", "frontend frameworks", "modern JavaScript",
    
    // Backend
    "Node.js tutorials", "Express.js guide", "backend development", "API development",
    "REST API", "GraphQL tutorials", "microservices", "server-side programming",
    "Django tutorials", "Flask guide", "Spring Boot", "Laravel PHP",
    
    // Database
    "SQL tutorials", "PostgreSQL guide", "MongoDB learning", "MySQL resources",
    "database design", "NoSQL databases", "Redis tutorials", "database management",
    "ORM tutorials", "Prisma guide", "Sequelize learning",
    
    // DevOps & Cloud
    "DevOps tutorials", "Docker guide", "Kubernetes learning", "CI/CD pipelines",
    "AWS tutorials", "Azure cloud", "Google Cloud Platform", "cloud computing",
    "infrastructure as code", "Terraform guide", "Jenkins tutorials",
    
    // Tools & Practices
    "Git tutorials", "GitHub guide", "version control", "code review",
    "testing frameworks", "Jest tutorials", "unit testing", "TDD BDD",
    "debugging techniques", "code quality", "clean code", "design patterns",
    "agile development", "scrum methodology", "software architecture",
    
    // Mobile & Desktop
    "mobile app development", "React Native tutorials", "Flutter guide",
    "iOS development", "Android programming", "cross-platform development",
    "Electron tutorials", "desktop applications",
    
    // Career & Interview
    "coding interview prep", "algorithm challenges", "data structures tutorial",
    "technical interview", "LeetCode solutions", "system design", "career development",
    "developer portfolio", "resume tips", "job search", "freelancing",
    
    // Community & Tools
    "developer community", "tech blogs", "programming podcasts", "code snippets",
    "developer tools", "IDE tutorials", "VS Code extensions", "productivity tools",
    "open source projects", "contribute to open source", "developer resources",
    
    // Concepts
    "object-oriented programming", "functional programming", "async programming",
    "web security", "authentication", "authorization", "encryption",
    "performance optimization", "accessibility", "SEO optimization",
    "progressive web apps", "single page applications", "state management",
    
    // Onja & Context
    "Onja coding bootcamp", "Madagascar developers", "coding education Africa",
    "developer training program", "tech education Madagascar", "learn programming free",
    "gamified learning", "progress tracking", "XP achievements", "developer leveling system"
  ],
  authors: [{ name: "Onja", url: "https://onja.org" }],
  creator: "Onja",
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
    url: "https://dev-resources.onja.org",
    siteName: "Dev Resources Hub",
    title: "Dev Resources Hub - 265+ Free Programming Tutorials & Learning Resources",
    description: "Curated collection of programming tutorials, web development courses, coding guides, and developer tools. Learn JavaScript, React, Python, Node.js, TypeScript, and more with gamified progress tracking.",
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
    canonical: "https://dev-resources.onja.org",
  },
  category: "technology",
  classification: "Education",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', sizes: 'any' }
    ],
    apple: '/apple-touch-icon.svg',
  },
  manifest: "/manifest.json",
  applicationName: "Dev Resources Hub",
  appleWebApp: {
    capable: true,
    title: "Dev Resources Hub",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: "google-site-verification-code", // Replace with actual code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <UserProgressProvider>
            {children}
          </UserProgressProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
