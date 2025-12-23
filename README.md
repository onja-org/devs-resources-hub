# Dev Resources Hub

A modern web application for discovering, sharing, and managing developer resources. Built with Next.js 16, TypeScript, Tailwind CSS, and Firebase.

## Features

- 🔐 **User Authentication** - Sign up/sign in with email and password
- 📚 **Resource Management** - Browse, search, and filter developer resources
- ❤️ **Favorites** - Save your favorite resources
- 💬 **Comments & Replies** - Discuss resources with nested comments (2 levels deep)
- ⭐ **Recommendations** - Recommend resources and share them with friends
- 🔔 **Real-time Notifications** - Get notified when someone recommends a resource to you
- 👥 **User Profiles** - User profiles with names stored in Firestore
- 🎨 **Modern UI** - Beautiful gradients, smooth transitions, and dark mode support
- 🔍 **Advanced Filtering** - Filter by type, tech stack, source, and recommendations
- 🔗 **Link Previews** - Automatic link preview cards using Microlink API
- 👨‍💼 **Admin Dashboard** - Manage resources, approve submissions, and view statistics
- 📝 **Resource Submission** - Users can submit new resources for approval

## Tech Stack

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

Admin users (email contains "admin") can:
- View all resources and statistics
- Approve/reject pending submissions
- Add resources directly (bypassing approval)
- Delete any resource
- Seed default resources for testing Firestore

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

Built with ❤️ by [Onja](https://github.com/onja-org)heir own favorites and recommendations
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
