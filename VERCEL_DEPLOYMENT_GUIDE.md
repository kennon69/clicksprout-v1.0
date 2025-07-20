# 🚀 ClickSprout v1.0 - Vercel Environment Variables Setup

## Required Environment Variables for Production Deployment

### Copy these to your Vercel Dashboard: Settings → Environment Variables

```bash
# 🤖 AI Content Generation (REQUIRED)
OPENAI_API_KEY=sk-your-openai-api-key-here

# 🗄️ Database Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 🔐 Authentication
NEXTAUTH_SECRET=your-random-secret-string-here
NEXTAUTH_URL=https://your-app-name.vercel.app

# 📱 Social Media Platform APIs
# Reddit
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_USERNAME=your-reddit-username
REDDIT_PASSWORD=your-reddit-password

# Medium
MEDIUM_INTEGRATION_TOKEN=your-medium-integration-token

# Pinterest
PINTEREST_ACCESS_TOKEN=your-pinterest-access-token

# Twitter/X (Optional)
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-twitter-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-twitter-access-token-secret

# Facebook (Optional)
FACEBOOK_ACCESS_TOKEN=your-facebook-access-token
FACEBOOK_PAGE_ID=your-facebook-page-id

# 🌍 Production Configuration
NODE_ENV=production
```

## 📋 Step-by-Step Vercel Setup:

### 1. Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository: `kennon69/clicksprout-v1.0`
3. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2. Add Environment Variables
1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable above with your actual values
3. Set Environment: `Production`, `Preview`, and `Development`

### 3. Required API Keys to Obtain:

#### OpenAI (REQUIRED)
- Go to: https://platform.openai.com/api-keys
- Create new secret key
- Add credits to your account

#### Supabase (REQUIRED for database)
- Go to: https://supabase.com/dashboard
- Create new project
- Go to Settings → API → Copy URL and anon key

#### Reddit API
- Go to: https://www.reddit.com/prefs/apps
- Create new app (script type)
- Get client ID and secret

#### Medium API
- Go to: https://medium.com/me/settings
- Integration tokens → Create new token

#### Pinterest API
- Go to: https://developers.pinterest.com/
- Create app → Get access token

### 4. Generate NEXTAUTH_SECRET
Run this command locally:
```bash
openssl rand -base64 32
```

### 5. Deploy Commands
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables via CLI
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... etc for each variable
```

## 🔧 Local Development Setup:
1. Copy `.env.example` to `.env.local`
2. Fill in your API keys
3. Run `npm run dev`

## 🚀 Production Features Enabled:
- ✅ AI content generation
- ✅ Multi-platform posting
- ✅ User authentication
- ✅ Database storage
- ✅ Analytics tracking
- ✅ Campaign scheduling

---

**Important**: Never commit actual API keys to GitHub. Use environment variables only!
