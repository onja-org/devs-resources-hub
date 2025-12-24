# Dev Resources Hub - Free Programming Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange)](https://firebase.google.com/)

A comprehensive web platform for discovering, sharing, and learning from 265+ curated programming tutorials, web development courses, coding guides, and developer tools. Features gamified learning with XP points, achievements, and progress tracking.

**Live Demo:** [https://dev-resources.onja.org](https://dev-resources.onja.org)

## 🚀 Key Features

- 📚 **265+ Curated Resources** - Programming tutorials, web development courses, coding bootcamps, documentation, tools, and videos
- 🎮 **Gamification System** - Earn XP points, unlock 17 unique achievements, maintain learning streaks, and level up
- 📊 **Progress Tracking** - Track completed resources, XP across categories, and personal growth metrics
- 🔍 **Advanced Search & Filters** - Search by keywords, filter by category, tech stack, difficulty, type, and source
- 🎯 **Personalized Learning** - Get recommendations based on your interests and progress
- 🔐 **User Authentication** - Secure sign up/sign in with email and password
- ❤️ **Favorites & Bookmarks** - Save and organize your favorite resources
- 💬 **Community Features** - Comments, replies, and resource recommendations
- 🔔 **Real-time Notifications** - Get notified of recommendations, achievements, and updates
- 👥 **User Profiles** - Track your XP, level, achievements, streaks, and completed resources
- 👨‍💼 **Admin Dashboard** - Manage resources, users, approve submissions, and automated link validation
- 🎨 **Modern UI/UX** - Responsive design, dark mode, smooth animations, and beautiful gradients
- 🔗 **Share Resources** - Copy shareable links to specific resources
- 🧹 **Link Validation** - Automated detection and removal of broken/dead links
- 📱 **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Performance Optimized** - Fast loading, efficient database queries, and optimized rendering
- 🔎 **SEO Optimized** - Comprehensive metadata, structured data, sitemap, and robots.txt

## 🛠️ Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework
- **Firebase** - Backend services
  - Authentication
  - Firestore Database
- **Microlink API** - Link preview generation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project created at [Firebase Console](https://console.firebase.google.com)
- Firebase Authentication enabled (Email/Password provider)
- Firestore Database created

### Installation

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/onja-org/devs-resources-hub.git
cd devs-resources-hub
npm install
```

2. Configure Firebase:

   - Copy `.env.local.example` to `.env.local`
   - Add your Firebase configuration values from your Firebase project settings
   - Enable Email/Password authentication in Firebase Console
   - Create a Firestore database

```bash
cp .env.local.example .env.local
```

3. Set up Firestore Collections:

The app uses the following collections:
- `resources` - All developer resources
- `resources/{id}/comments` - Comments for each resource
- `users` - User profiles (name, email, createdAt)
- `notifications` - User notifications for recommendations

4. Create an Admin User:

   - Sign up with an email containing "admin" (e.g., admin@example.com)
## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage with resource list
│   ├── admin/             # Admin dashboard
│   ├── submit/            # Resource submission page
│   └── resource/[id]/     # Individual resource page
├── components/            # React components
│   ├── Header.tsx         # Navigation header with notifications
│   ├── ResourceCard.tsx   # Resource card with actions
│   ├── ResourceList.tsx   # Grid view with filters
│   ├── CommentModal.tsx   # Modal for viewing/commenting
│   ├── CommentSection.tsx # Comment display with replies
│   ├── RecommendModal.tsx # Modal for recommending to friends
│   ├── NotificationBell.tsx # Notification dropdown
│   ├── AuthModal.tsx      # Sign in/sign up modal
│   └── AdminDashboard.tsx # Admin management interface
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication state management
├── lib/                   # Utility functions
│   ├── firebase.ts        # Firebase initialization
│   ├── auth.ts            # Authentication helpers
│   ├── firestore.ts       # Firestore helpers
│   └── seed.ts            # Default resources seed data
└── types/                 # TypeScript type definitions
    └── resource.ts        # Resource, Comment, Notification types
``` run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
## Key Features Explained

### Authentication & User Profiles

Users can sign up with email, password, and name. User profiles are automatically created in Firestore with:
- Name (displayed in comments and notifications)
- Email
- Created timestamp

```typescript
// Sign up creates both Firebase Auth user and Firestore profile
await signUp('email@example.com', 'password', 'John Doe');
```

### Resource Management

Resources have the following properties:
- Title, description, link
- Type (Documentation, Tutorial, Tool, Blog, Community)
- Tech stack (array of technologies)
- Source (organization/creator)
- Approval status (admin-only)
- Favorites (array of user IDs)
- Recommendations (array of user IDs)

### Comments System

- Two-level nested comments (comments and replies)
- Real-time updates without page refresh
- User names displayed from Firestore profiles
- Comments stored in subcollection: `resources/{id}/comments`

### Recommendation System

Users can:
1. **Personally recommend** - Click the green badge to mark a resource as recommended
2. **Share with friends** - Click the purple share button to send a notification to another user

When you recommend to a friend:
- A notification is created in Firestore
- Friend sees unread count badge on notification bell
- Clicking notification marks it as read

### Admin Features

Admin users (email contains "admin" or has `isAdmin: true` in Firestore) can:
- View all resources and statistics
- Approve/reject pending submissions
- Add resources directly (bypassing approval)
- Delete any resource
- Seed default resources for testing Firestore
- **Remove duplicate resources** with one click
- **Scan for broken links** - Check all resource URLs for validity
- **Automatically remove broken links** - Delete resources with dead/404 links
- Filter resources by pending, approved, or broken links
- Sort resources by newest, oldest, most helpful, most viewed, or most completed

#### Broken Link Detection

The admin dashboard includes automated link validation:

**UI Buttons:**
- **🔍 Scan Links**: Check all resources without deleting (dry run)
- **🧹 Remove Broken**: Automatically delete resources with broken links

**CLI Script:**
```bash
# Scan only (recommended first)
npm run validate-links

# Delete broken resources
npm run cleanup-broken-links
```

See [Broken Link Detection Guide](docs/BROKEN_LINK_DETECTION.md) for detailed documentation.

Use the provided Firestore helpers for database operations:

```typescript
import { addDocument, getDocument, updateDocument, deleteDocument } from '@/lib/firestore';

// Add document
const id = await addDocument('users', { name: 'John Doe' });

// Get document
const user = await getDocument('users', id);

// Update document
await updateDocument('users', id, { name: 'Jane Doe' });

// Delete document
await deleteDocument('users', id);
## Environment Variables

Create a `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Development Tips

### Adding New Features

- Authentication state is available via `useAuth()` hook
- All modals use fixed positioning with backdrop blur
- Resource cards use flex layouts for consistent heights
- Comments are stored in subcollections for better performance
- User profiles should be fetched and cached when needed

### Common Tasks

**Add a new resource type:**
1. Update the type filter options in `ResourceList.tsx`
2. Add the type to the seed data in `lib/seed.ts`

**Modify comment depth:**
- Change the `depth < 2` condition in `CommentModal.tsx`
- Update the recursive `renderComment` function

**Customize admin access:**
- Modify the `isAdmin` check in `AdminDashboard.tsx`
- Currently checks for "admin" in email address

## Troubleshooting

**"No users found" in recommend modal:**
- Make sure users signed up with the updated form (includes name field)
- Check Firestore `users` collection has documents with `name` and `email` fields

**Comments not showing usernames:**
- Verify user profiles exist in `users` collection
- Check browser console for profile fetch errors

**Admin page redirects to home:**
- Ensure your email contains "admin"
- Check browser console for authentication state
- Clear browser cache and cookies

**Notifications not appearing:**
- Check `notifications` collection in Firestore
- Verify `userId` matches the logged-in user's UID
- Check browser console for fetch errors

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Microlink API Documentation](https://microlink.io/docs)

## Deployment

### Deploy on Vercel

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel project settings
4. Deploy!

### Deploy on Other Platforms

Set the following build commands:
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

Make sure to add all environment variables from `.env.local` to your hosting platform.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or production.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## SEO & Discoverability

This project is optimized for search engines with:

- **Comprehensive Metadata** - Rich meta tags, Open Graph, Twitter Cards
- **Structured Data** - JSON-LD for EducationalOrganization, FAQPage, and Course schema
- **Dynamic Sitemap** - Auto-generated sitemap.xml for search engines
- **Robots.txt** - Proper crawler directives
- **Semantic HTML** - Proper heading hierarchy and semantic elements
- **Rich Keywords** - 100+ relevant programming and web development keywords
- **Performance** - Fast loading times and Core Web Vitals optimization
- **Mobile-First** - Responsive design for all devices
- **Accessibility** - WCAG compliant for inclusive access

### Keywords Coverage

Programming: JavaScript, TypeScript, Python, Java, C++, Ruby, PHP, Go, Rust, Kotlin, Swift, Scala
Frontend: React, Vue.js, Angular, Svelte, Next.js, HTML, CSS, Tailwind, Bootstrap, Web Components
Backend: Node.js, Express, Django, Flask, Spring Boot, Laravel, REST API, GraphQL, Microservices
Database: SQL, PostgreSQL, MongoDB, MySQL, Redis, NoSQL, ORM, Prisma, Sequelize
DevOps: Docker, Kubernetes, CI/CD, AWS, Azure, Google Cloud, Terraform, Jenkins
Tools: Git, GitHub, VS Code, Testing, Jest, Debugging, Design Patterns, Algorithms
Career: Coding Interview, LeetCode, System Design, Portfolio, Resume, Freelancing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support, email support@onja.org or join our community discussions.

---

Built with ❤️ by [Onja](https://onja.org) - Empowering developers worldwide with free, curated learning resources.heir own favorites and recommendations
- Users can add comments to resources
- Authenticated users can read user profiles
- Users can read their own notifications

## Usage

### For Regular Users

1. **Browse Resources** - View all approved resources on the homepage
2. **Search & Filter** - Use search bar and filters (type, tech stack, source, recommendations)
3. **Sign Up** - Create an account to unlock all features
4. **Favorite Resources** - Click the heart icon to save favorites
5. **View Details** - Click "View Details" to see full resource info, comments, and link preview
6. **Comment** - Add comments or reply to existing comments (2 levels deep)
7. **Recommend** - Click green badge to personally recommend a resource
8. **Share with Friends** - Click purple share button to notify a friend
9. **Check Notifications** - Click bell icon to see friend recommendations
10. **Submit Resources** - Use the Submit page to suggest new resources

### For Admin Users

1. **Access Dashboard** - Navigate to `/admin` (requires "admin" in email)
2. **View Statistics** - See total, approved, and pending resource counts
3. **Manage Resources** - Approve, reject, or delete resources
4. **Add Resources** - Create resources directly without approval process
5. **Seed Data** - Add default resources for testing/developmentT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# devs-resources-hub
