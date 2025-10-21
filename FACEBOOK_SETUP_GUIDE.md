# Facebook Integration Setup Guide for Lawncha Libre

## System Prompts for Infrastructure Setup

### Option 1: Client-Specific Facebook Apps (Recommended)

#### System Prompt for Client Onboarding

```
You are setting up Facebook integration for a landscaping business client. Follow these steps to create a Facebook Developer account and app for the client:

**STEP 1: Facebook Developer Account Setup**
1. Go to https://developers.facebook.com/
2. Click "Get Started" and sign in with the client's Facebook account
3. Complete developer registration (requires phone verification)
4. Accept Facebook's Developer Terms and Platform Policies

**STEP 2: Create Facebook App**
1. In Facebook Developer Console, click "Create App"
2. Choose "Business" as app type
3. Fill in required information:
   - App Name: "[Client Business Name] Landscaping App"
   - App Contact Email: [Client's business email]
   - App Purpose: "Business management and social media integration"
4. Create the app

**STEP 3: Configure App Settings**
1. Go to App Settings > Basic
2. Add App Domains: [Your domain name]
3. Add Website Platform:
   - Site URL: https://yourdomain.com
   - Privacy Policy URL: https://yourdomain.com/privacy
   - Terms of Service URL: https://yourdomain.com/terms

**STEP 4: Request Permissions**
1. Go to App Review > Permissions and Features
2. Request these permissions:
   - pages_show_list
   - pages_read_engagement
   - pages_manage_posts
   - pages_manage_metadata
   - instagram_basic (if Instagram integration needed)

**STEP 5: Get App Credentials**
1. Copy App ID from App Settings > Basic
2. Copy App Secret from App Settings > Basic
3. Set up OAuth Redirect URI: https://yourdomain.com/auth/facebook/callback

**STEP 6: Configure in Lawncha Libre**
1. Log into Lawncha Libre dashboard
2. Go to Social Media Management
3. Add Facebook App Credentials:
   - App ID: [From Step 5]
   - App Secret: [From Step 5]
   - Redirect URI: [From Step 5]
4. Test the connection

**STEP 7: Connect Facebook Page**
1. Go to Social Settings in Lawncha Libre
2. Click "Connect Facebook Page"
3. Authorize the app
4. Select the business's Facebook page
5. Grant necessary permissions

**STEP 8: Verify Integration**
1. Go to Social Feed
2. Verify that Facebook posts are loading
3. Test the Facebook Project Porting feature
4. Ensure projects appear on homepage

**IMPORTANT NOTES:**
- Keep App Secret secure and never share it publicly
- Complete Facebook App Review for production use
- Business Verification may be required for certain permissions
- Test thoroughly before going live

**TROUBLESHOOTING:**
- If posts don't load: Check permissions and app review status
- If connection fails: Verify redirect URI matches exactly
- If app review fails: Provide detailed use case descriptions
```

#### System Prompt for Technical Implementation

```
You are implementing the Facebook integration infrastructure for multiple clients. Each client will have their own Facebook app credentials. Implement the following technical setup:

**1. Database Schema Updates**
- Ensure facebookAppCredentials table supports multiple clients
- Add client identification fields
- Implement proper encryption for app secrets
- Add validation for Facebook app credentials

**2. Client Onboarding Flow**
- Create step-by-step wizard for Facebook app setup
- Add validation checks for Facebook app credentials
- Implement connection testing before saving credentials
- Add error handling and user feedback

**3. Multi-Client Support**
- Ensure each client can only access their own Facebook data
- Implement proper user isolation in database queries
- Add client-specific error messages and support
- Create admin tools for managing client Facebook integrations

**4. Security Measures**
- Encrypt all Facebook app secrets in database
- Implement proper access controls
- Add audit logging for Facebook API calls
- Create secure credential storage system

**5. Monitoring and Analytics**
- Track Facebook API usage per client
- Monitor connection health and errors
- Implement rate limiting and quota management
- Create client-specific Facebook integration dashboards

**6. Documentation and Support**
- Create client-facing setup guides
- Implement in-app help and tooltips
- Add troubleshooting guides
- Create support ticket system for Facebook integration issues
```

### Option 2: Facebook Page Plugin (Alternative)

#### System Prompt for Facebook Page Plugin Implementation

```
You are implementing Facebook Page Plugin integration as an alternative to the Graph API. This approach doesn't require app review but has limitations.

**STEP 1: Facebook Page Plugin Setup**
1. Go to https://developers.facebook.com/docs/plugins/page-plugin
2. Configure the Page Plugin:
   - Facebook Page URL: [Client's Facebook page URL]
   - Width: 340px
   - Height: 500px
   - Tabs: timeline, events, messages
   - Small Header: false
   - Adapt Container Width: true
   - Hide Cover: false
   - Show Facepile: true

**STEP 2: Generate Plugin Code**
1. Click "Get Code" to generate the plugin HTML
2. Copy the generated code
3. Note the Facebook App ID used in the code

**STEP 3: Implement in Lawncha Libre**
1. Create a new component: FacebookPagePlugin.tsx
2. Implement the plugin using React
3. Add proper styling and responsive design
4. Handle loading states and errors

**STEP 4: Integration with Homepage**
1. Add Facebook Page Plugin to homepage
2. Make it responsive for mobile devices
3. Add fallback content if plugin fails to load
4. Implement proper error handling

**STEP 5: Client Configuration**
1. Create admin interface for plugin configuration
2. Allow clients to input their Facebook page URL  
3. Store configuration in database
4. Implement dynamic plugin generation

**LIMITATIONS OF THIS APPROACH:**
- Only shows public posts
- Cannot access post data programmatically
- Limited customization options
- Cannot integrate with project porting system
- No access to post metadata or analytics

**IMPLEMENTATION CONSIDERATIONS:**
- Use as fallback when Graph API is not available
- Implement proper error handling for plugin failures
- Add loading states and user feedback
- Ensure mobile responsiveness
- Consider performance impact of loading Facebook scripts
```

#### Technical Implementation Prompt for Page Plugin

```
You are implementing the Facebook Page Plugin as an alternative integration method. Implement the following:

**1. React Component Implementation**
- Create FacebookPagePlugin.tsx component
- Implement proper TypeScript types
- Add error handling and loading states
- Ensure responsive design

**2. Dynamic Plugin Configuration**
- Create admin interface for plugin settings
- Store client Facebook page URLs in database
- Generate dynamic plugin code based on client configuration
- Implement validation for Facebook page URLs

**3. Homepage Integration**
- Add plugin to homepage in appropriate section
- Implement proper styling and layout
- Add mobile-responsive design
- Handle plugin loading failures gracefully

**4. Admin Management**
- Create interface for managing plugin settings
- Add preview functionality
- Implement plugin testing tools
- Create documentation for clients

**5. Fallback Strategy**
- Implement fallback content when plugin fails
- Add error messages and troubleshooting
- Create alternative content display methods
- Ensure graceful degradation

**6. Performance Optimization**
- Lazy load Facebook SDK
- Implement proper caching strategies
- Optimize plugin loading times
- Monitor performance impact
```

## Implementation Priority

### Phase 1: Client-Specific Apps (Primary)
1. Implement client onboarding flow
2. Create Facebook app setup wizard
3. Build credential management system
4. Implement multi-client support

### Phase 2: Facebook Page Plugin (Fallback)
1. Create plugin component
2. Implement admin configuration
3. Add to homepage
4. Create fallback strategies

### Phase 3: Hybrid Approach
1. Use Graph API when available
2. Fall back to Page Plugin when needed
3. Implement seamless switching
4. Create unified client experience

## Success Metrics

### Client-Specific Apps
- Number of clients successfully setting up Facebook apps
- Time to complete Facebook app setup
- Facebook API integration success rate
- Client satisfaction with Facebook features

### Facebook Page Plugin
- Plugin loading success rate
- User engagement with plugin content
- Mobile responsiveness metrics
- Fallback usage statistics

## Support and Maintenance

### Client Support
- Create comprehensive setup guides
- Implement in-app help system
- Provide troubleshooting tools
- Create support ticket system

### Technical Maintenance
- Monitor Facebook API changes
- Update integration code as needed
- Maintain security best practices
- Regular testing and validation
