'use client';

export default function FAQSection() {
  const faqs = [
    {
      question: "What is Dev Resources Hub?",
      answer: "Dev Resources Hub is a curated collection of 265+ programming tutorials, web development courses, coding bootcamps, and developer tools. We offer free learning resources for JavaScript, React, Python, Node.js, TypeScript, and many other technologies with gamified progress tracking."
    },
    {
      question: "Is Dev Resources Hub free to use?",
      answer: "Yes! All 265+ curated resources are completely free to access. We believe in making quality programming education accessible to everyone, regardless of their financial situation."
    },
    {
      question: "What programming languages and technologies are covered?",
      answer: "We cover JavaScript, TypeScript, Python, React, Vue.js, Angular, Node.js, Express, Django, Flask, databases (SQL, MongoDB, PostgreSQL), DevOps tools (Docker, Kubernetes), cloud platforms (AWS, Azure, GCP), Git, testing frameworks, mobile development, and much more."
    },
    {
      question: "How does the gamification system work?",
      answer: "Earn XP points by completing resources, maintain daily streaks, unlock 17 unique achievements, and level up your developer profile. Track your progress across different categories and compete with other learners."
    },
    {
      question: "Can I contribute resources?",
      answer: "Yes! If you have admin access, you can add, edit, and curate resources. We welcome high-quality tutorials, courses, documentation, and tools that help developers learn and grow."
    },
    {
      question: "What skill levels are the resources suitable for?",
      answer: "Our resources cater to all skill levels - from complete beginners learning to code for the first time, to advanced developers looking to master new frameworks, design patterns, and best practices."
    },
    {
      question: "How are resources organized?",
      answer: "Resources are organized by categories (Frontend, Backend, DevOps, Mobile, etc.), difficulty levels (Beginner, Intermediate, Advanced), and types (Tutorial, Course, Documentation, Tool, Video). Use our powerful search and filter system to find exactly what you need."
    },
    {
      question: "Can I track my learning progress?",
      answer: "Absolutely! Our progress tracking system lets you mark resources as completed, track your XP across categories, monitor your learning streaks, and see your achievements. View your personalized dashboard to see your growth over time."
    }
  ];

  const jsonLdFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
      />
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <details key={index} className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                {faq.question}
                <span className="ml-4 transition group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-blue-500">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
