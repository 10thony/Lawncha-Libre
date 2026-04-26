# Lawncha Libre - Landscaping Website with Social Media Integration

A comprehensive landscaping business management platform built with modern web technologies, featuring appointment booking, project management, testimonials, and **Facebook/Instagram social media integration**.

## 🚀 Features

### Core Business Features
- **User Authentication**: Clerk-based authentication with Facebook SSO
- **Profile Management**: Separate profiles for business owners and clients
- **Appointment Booking**: Calendar-based appointment scheduling system
- **Project Management**: Task tracking and project lifecycle management
- **Testimonials & Reviews**: Customer feedback and rating system
- **Quote Requests**: Intake forms for project estimates
- **File Uploads**: Image and video uploads via UploadThing

### 🎯 Social Media Integration (NEW!)
- **Facebook SSO**: Sign in with Facebook via Clerk
- **Meta Content Access**: Connect Facebook Pages and Instagram Business accounts
- **Social Feed**: View Instagram and Facebook content in unified interface
- **Content Management**: Automatic content syncing and token refresh
- **Social Settings**: Manage social media connections and permissions
- **User-Specific Credentials**: Each user manages their own Facebook app credentials securely

## 🛠 Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Authentication**: Clerk (with Facebook SSO)
- **Backend**: Convex (real-time database + serverless functions)
- **File Storage**: UploadThing
- **Social APIs**: Meta Graph API (Facebook + Instagram)
- **Styling**: Tailwind CSS + CSS Modules

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── Dashboard.tsx          # Main dashboard with tabs
│   ├── SocialConnections.tsx  # Social media settings
│   ├── SocialFeed.tsx         # Instagram/Facebook feed
│   ├── AppointmentBooking.tsx # Calendar booking
│   ├── ProjectsDashboard.tsx  # Project management
│   └── ...                    # Other business components
├── lib/
│   ├── utils.ts              # Utility functions
│   └── uploadthing.ts         # File upload configuration
└── App.tsx                    # Main app component

convex/
├── schema.ts                  # Database schema
├── metaAuth.ts               # Facebook OAuth & authentication
├── metaContent.ts            # Content fetching from Meta APIs
├── metaQueries.ts            # Query functions for social data
├── router.ts                 # HTTP routes (including OAuth callback)
├── crons.ts                  # Scheduled jobs for content sync
├── auth.ts                   # Clerk authentication
├── profiles.ts               # User profile management
├── appointments.ts           # Appointment system
├── projects.ts               # Project management
├── testimonials.ts           # Reviews system
└── intakeForms.ts            # Quote request forms
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm
- Convex account
- Clerk account
- Facebook Developer account (for social integration)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd lawncha-libre
   pnpm install
   ```

2. **Set up Convex**
   ```bash
   pnpm convex dev
   ```

3. **Configure environment variables**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Add your keys (see setup guides below)
   ```

4. **Start development servers**
   ```bash
   pnpm dev
   ```

## 🔧 Configuration

### Basic Setup
1. **Convex**: Follow [Convex setup guide](https://docs.convex.dev/)
2. **Clerk**: Set up authentication in [Clerk dashboard](https://dashboard.clerk.com/)
3. **UploadThing**: Configure file uploads in [UploadThing dashboard](https://uploadthing.com/)

### Social Media Integration Setup
For Facebook/Instagram integration, follow the detailed guide:

📖 **[Facebook Integration Setup Guide](./FACEBOOK_INTEGRATION_SETUP.md)**

**Quick Overview:**
1. Create Facebook App in [Facebook Developers](https://developers.facebook.com/)
2. Enable Facebook provider in Clerk dashboard
3. Configure your Facebook app credentials in the Social Media Management tab
4. Set up OAuth redirect URIs in your Facebook app
5. Link Instagram Business account to Facebook Page

**Note**: Each user manages their own Facebook app credentials securely. No global configuration needed!

## 🌐 Environment Variables

### Required for Basic Functionality
```bash
# Convex
CONVEX_DEPLOYMENT=your-convex-deployment
CONVEX_URL=your-convex-url

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# UploadThing
UPLOADTHING_TOKEN=your-uploadthing-token
```

### Required for Social Media Integration
```bash
# Encryption Master Secret (set in Convex environment)
ENCRYPTION_MASTER_SECRET=your_encryption_master_secret

# Frontend URL for OAuth redirects
FRONTEND_URL=https://yourdomain.com
```

**Note**: Facebook app credentials are now managed per-user through the Social Media Management interface. No global Facebook app configuration needed!

## 📱 Features Overview

### Dashboard
- **Overview**: Profile information and quick stats
- **Appointments**: Calendar-based booking system
- **Projects**: Task management and project tracking
- **Reviews**: Customer testimonials and ratings
- **Social Feed**: Instagram and Facebook content display
- **Social Settings**: Manage social media connections
- **Social Management**: Configure Facebook app credentials securely

### Social Media Integration
- **Dual Authentication**: Clerk (identity) + Meta (content access)
- **Instagram Business**: Access Instagram Business/Creator accounts
- **Facebook Pages**: Connect and manage multiple Facebook Pages
- **Content Sync**: Automatic content fetching and token refresh
- **Unified Feed**: View all social content in one interface
- **Secure Credentials**: User-specific Facebook app credentials with AES-256 encryption

### Business Management
- **User Types**: Separate interfaces for business owners and clients
- **Appointment System**: Available slots, booking, and management
- **Project Lifecycle**: Planning, approval, execution, completion
- **Quote System**: Intake forms with image/video uploads
- **Review System**: Customer feedback and business ratings

## 🔒 Security Features

- **OAuth 2.0**: Secure Facebook/Instagram authentication
- **CSRF Protection**: State parameter validation for OAuth
- **Token Management**: Secure server-side token storage
- **Permission Scoping**: Minimal required permissions
- **HTTPS Enforcement**: Required for production OAuth callbacks

## 🚀 Deployment

### Development
```bash
pnpm dev          # Start both frontend and backend
pnpm dev:frontend # Frontend only
pnpm dev:backend  # Backend only
```

### Production
1. **Deploy Convex**: `pnpm convex deploy`
2. **Deploy Frontend**: Deploy to Vercel, Netlify, or your preferred platform
3. **Configure Environment**: Set production environment variables
4. **Update OAuth URLs**: Update Facebook App and Clerk redirect URIs

## 📚 Documentation

- **[Convex Docs](https://docs.convex.dev/)**: Backend and database
- **[Clerk Docs](https://clerk.com/docs/)**: Authentication
- **[Facebook Developer Docs](https://developers.facebook.com/docs/)**: Social APIs
- **[shadcn/ui Docs](https://ui.shadcn.com/)**: UI components
- **[Vite Docs](https://vitejs.dev/)**: Frontend build tool

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially OAuth flows)
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Issues**: Create GitHub issues for bugs or feature requests
- **Documentation**: Check the setup guides and API documentation
- **Community**: Join the Convex and Clerk communities for help

---

**Built with ❤️ for landscaping businesses**
