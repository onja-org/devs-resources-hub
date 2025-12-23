import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export const defaultResources = [
  {
    title: 'MDN Web Docs',
    description: 'Comprehensive documentation for web technologies including HTML, CSS, JavaScript, and Web APIs. The go-to reference for web developers worldwide.',
    link: 'https://developer.mozilla.org',
    type: 'Documentation',
    techStack: ['HTML', 'CSS', 'JavaScript', 'Web APIs'],
    source: 'Mozilla',
    approved: true,
    favorites: [],
    comments: [],
    recommendations: [],
  },
  {
    title: 'React Documentation',
    description: 'Official React documentation with guides, API reference, and interactive examples. Learn how to build user interfaces with React.',
    link: 'https://react.dev',
    type: 'Documentation',
    techStack: ['React', 'JavaScript', 'TypeScript'],
    source: 'Meta',
    approved: true,
    favorites: [],
    comments: [],
    recommendations: [],
  },
  {
    title: 'Next.js Documentation',
    description: 'Complete guide to Next.js, the React framework for production. Covers App Router, Server Components, and deployment strategies.',
    link: 'https://nextjs.org/docs',
    type: 'Documentation',
    techStack: ['Next.js', 'React', 'TypeScript'],
    source: 'Vercel',
    approved: true,
    favorites: [],
    comments: [],
    recommendations: [],
  },
  {
    title: 'TypeScript Handbook',
    description: 'Official TypeScript documentation covering basics to advanced topics. Learn type safety and modern JavaScript development.',
    link: 'https://www.typescriptlang.org/docs',
    type: 'Documentation',
    techStack: ['TypeScript', 'JavaScript'],
    source: 'Microsoft',
    approved: true,
    favorites: [],
    comments: [],
    recommendations: [],
  },
  {
    title: 'Tailwind CSS',
    description: 'A utility-first CSS framework for rapidly building custom user interfaces. Highly customizable and performance-focused.',
    link: 'https://tailwindcss.com/docs',
    type: 'Documentation',
    techStack: ['CSS', 'Tailwind CSS'],
    source: 'Tailwind Labs',
    approved: true,
    favorites: [],
    comments: [],
    recommendations: [],
  },
  {
    title: 'Firebase Documentation',
    description: 'Complete guide to Firebase services including Authentication, Firestore, Storage, and Cloud Functions. Build apps without managing infrastructure.',
    link: 'https://firebase.google.com/docs',
    type: 'Documentation',
    techStack: ['Firebase', 'JavaScript', 'Cloud'],
    source: 'Google',
    approved: true,
    favorites: [],
    comments: [],
    recommendations: [],
  },
  {
    title: 'freeCodeCamp',
    description: 'Free coding bootcamp with thousands of hours of content. Learn web development, data science, machine learning, and more through interactive challenges.',
    link: 'https://www.freecodecamp.org',
    type: 'Tutorial',
    techStack: ['HTML', 'CSS', 'JavaScript', 'Python', 'React'],
    source: 'freeCodeCamp',
    approved: true,
    favorites: [],
    comments: [],
    recommendations: [],
  },
  {
    title: 'GitHub',
    description: 'The world\'s largest code hosting platform. Collaborate on projects, explore open source, and showcase your work.',
    link: 'https://github.com',
    type: 'Tool',
    techStack: ['Git', 'Version Control'],
    source: 'Microsoft',
    approved: true,
    favorites: [],
    comments: [],
    recommendations: [],
  },
  {
    title: 'Stack Overflow',
    description: 'The largest online community for programmers to learn, share knowledge, and build their careers. Find answers to coding questions.',
    link: 'https://stackoverflow.com',
    type: 'Community',
    techStack: ['Programming', 'Q&A'],
    source: 'Stack Exchange',
    approved: true,
    favorites: [],
    comments: [],
    recommendations: [],
  },
  {
    title: 'CSS-Tricks',
    description: 'Articles, tutorials, and resources about web design and development. Focus on CSS, JavaScript, and front-end techniques.',
    link: 'https://css-tricks.com',
    type: 'Blog',
    techStack: ['CSS', 'JavaScript', 'HTML'],
    source: 'DigitalOcean',
    approved: true,
    favorites: [],
    comments: [],
    recommendations: [],
  },
  {
    title: 'Web.dev',
    description: 'Google\'s resource for modern web development. Learn best practices for performance, accessibility, and progressive web apps.',
    link: 'https://web.dev',
    type: 'Tutorial',
    techStack: ['Web Development', 'Performance', 'Accessibility'],
    source: 'Google',
    approved: true,
    favorites: [],
    comments: [],
    recommendations: [],
  },
  {
    title: 'JavaScript.info',
    description: 'Modern JavaScript tutorial covering fundamentals to advanced topics. Clear explanations with interactive examples.',
    link: 'https://javascript.info',
    type: 'Tutorial',
    techStack: ['JavaScript'],
    source: 'Community',
    approved: true,
    favorites: [],
    comments: [],
    recommendations: [],
  },
];

export async function seedDefaultResources() {
  const resourcesRef = collection(db, 'resources');
  
  try {
    for (const resource of defaultResources) {
      await addDoc(resourcesRef, {
        ...resource,
        createdAt: Timestamp.now(),
      });
    }
    
    return { success: true, count: defaultResources.length };
  } catch (error: any) {
    console.error('Error adding default resources:', error);
    return { success: false, error };
  }
}
