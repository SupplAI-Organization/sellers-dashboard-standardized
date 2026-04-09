# Seller Dashboard - B2B Marketplace

A modern, real-time sellers dashboard for a B2B marketplace platform built with Next.js, React, TypeScript, and Supabase.

## 🚀 Features

- **Authentication**: Email/password sign-up and sign-in with Google OAuth
- **Seller Onboarding**: Complete seller profile setup with business details
- **Dashboard**: Real-time sales analytics and order overview
- **Product Management**: Create, view, and manage product listings
- **Orders & Shipments**: Track and manage buyer orders (coming soon)
- **Buyer Relationships**: View and manage buyer communications
- **Real-time Messaging**: Live product inquiry messaging with buyers
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Backend**: Supabase (Auth, Database, Real-time)
- **Charts**: Recharts for analytics
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account and project

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sellers-dashboard-standardized
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   
   Get these values from your Supabase project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your public anon key
   - `NEXT_PUBLIC_SITE_URL`: Your app's URL (localhost:3000 for development)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/                    # Authenticated routes with sidebar layout
│   │   ├── dashboard/            # Main dashboard page
│   │   ├── myproducts/           # Product listing and management
│   │   │   ├── new/              # Create new product
│   │   │   └── [id]/             # Product detail page
│   │   ├── orders/               # Orders management (coming soon)
│   │   ├── buyers/               # Buyer relationships (coming soon)
│   │   ├── settings/             # Account settings
│   │   └── layout.tsx            # App layout with sidebar
│   ├── login/                    # Authentication page
│   ├── onboarding/               # Initial seller setup
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirect to dashboard)
│   └── globals.css               # Global styles
├── components/
│   ├── AppSidebar.tsx            # Navigation sidebar
│   ├── MessagesSheet.tsx         # Real-time messaging component
│   ├── auth/
│   │   └── LogoutButton.tsx      # Logout button
│   ├── ui/                       # shadcn/ui components
│   └── ...
├── hooks/
│   └── use-mobile.ts             # Mobile detection hook
├── lib/
│   ├── auth.ts                   # Auth functions
│   ├── supabaseClient.ts         # Browser Supabase client
│   ├── supabaseServer.ts         # Server Supabase client
│   └── utils.ts                  # Utility functions
```

## 🔐 Authentication Flow

1. **Login Page** (`/login`)
   - Email/password authentication
   - Google OAuth sign-in
   - Sign up for new users

2. **Onboarding** (`/onboarding`)
   - Collect seller business details
   - Create user profile in Supabase
   - Create supplier record

3. **Protected Routes** (`/app/*`)
   - Server-side authentication checks
   - Automatic redirect to login if not authenticated
   - Automatic redirect to onboarding if profile incomplete

## 📊 Database Tables

The application uses the following Supabase tables:

- **users**: Seller profiles with business information
- **suppliers**: Supplier/factory information
- **products**: Product listings with details
- **messages**: Real-time product inquiries
- **buyers**: Buyer profiles and information

See your Supabase dashboard for schema details.

## 🎨 UI Components

- **AppSidebar**: Main navigation with collapsible menu
- **Card**: Container for content sections
- **Button**: Primary and secondary actions
- **Input/Textarea**: Form input fields
- **Select**: Dropdown selections
- **Badge**: Status and category tags
- **Alert**: Error and success messages
- **LineChart**: Sales analytics visualization
- **Separator**: Visual dividers

## 🔄 Real-time Features

The dashboard uses Supabase Real-time subscriptions for:
- Product inquiries from buyers
- Order updates
- Message notifications

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
vercel deploy
```

### Deploy to Other Platforms

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 📝 Environment Variables

Make sure to set these in your deployment platform:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=your_production_url
```

## 🐛 Debugging

- Check browser console for frontend errors
- Enable Supabase logs in project settings
- Use browser DevTools to inspect network requests
- Check server logs for API errors

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## 📄 License

This project is proprietary and confidential.
