# Padel Tracker 🎾

A modern web application for tracking professional padel tournaments, player rankings, and head-to-head statistics.

## Features

- **Live Tournament Tracking** - Real-time scores and match updates from Premier Padel and FIP Tour
- **Player Rankings** - Up-to-date rankings for men's and women's professional padel
- **Head-to-Head Comparison** - Compare players with detailed statistics and match history
- **Player Profiles** - Career stats, partner history, and tournament timeline
- **Favorites** - Follow your favorite players and get updates on their matches
- **PWA Support** - Install as a mobile app with offline capabilities
- **Push Notifications** - Get notified when your favorite players are playing

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Database**: [Prisma](https://www.prisma.io/) with SQLite
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Authentication**: [NextAuth v5](https://authjs.dev/)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics)
- **PWA**: [@ducanh2912/next-pwa](https://github.com/ducanh2912/next-pwa)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/padel-tracker.git
cd padel-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── compare/        # H2H comparison page
│   ├── favorites/      # User favorites page
│   ├── player/         # Player profile pages
│   ├── rankings/       # Rankings page
│   ├── tournament/     # Tournament detail pages
│   └── tournaments/    # Tournament list page
├── components/         # React components
├── context/           # React contexts
├── hooks/             # Custom hooks
└── lib/               # Utility functions and data fetching
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Prisma database connection string |
| `NEXTAUTH_URL` | NextAuth base URL |
| `NEXTAUTH_SECRET` | NextAuth secret key |
| `VAPID_PUBLIC_KEY` | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key |

## Deployment

The app is optimized for deployment on [Vercel](https://vercel.com):

```bash
npm run build
```

See the [deployment workflow](.agent/workflows/deploy_to_vercel.md) for detailed instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
