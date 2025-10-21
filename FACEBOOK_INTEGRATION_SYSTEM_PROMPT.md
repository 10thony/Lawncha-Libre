# Facebook Integration System Prompt for Lawncha Libre

## Overview
This system prompt provides comprehensive instructions for implementing Facebook integration infrastructure that supports both client-specific Facebook apps (Option 1) and Facebook Page Plugin fallback (Option 2) for the Lawncha Libre landscaping business management platform.

## Implementation Architecture

### Core Components

#### 1. Facebook App Setup Wizard (`FacebookAppSetupWizard.tsx`)
**Purpose**: Guides clients through creating their own Facebook Developer apps

**Key Features**:
- Step-by-step wizard interface
- Interactive setup guidance
- Credential validation and testing
- Security best practices
- Progress tracking

**Implementation Steps**:
```typescript
// 1. Create wizard component with 5 steps
// 2. Implement step-by-step navigation
// 3. Add credential input and validation
// 4. Integrate with existing credential storage system
// 5. Add testing and verification functionality
```

#### 2. Facebook Page Plugin (`FacebookPagePlugin.tsx`)
**Purpose**: Alternative integration method using Facebook's official Page Plugin

**Key Features**:
- Facebook SDK integration
- Responsive design support
- Error handling and retry logic
- Configuration management
- Preview functionality

**Implementation Steps**:
```typescript
// 1. Create plugin component with SDK loading
// 2. Implement configuration interface
// 3. Add responsive design support
// 4. Create admin configuration panel
// 5. Integrate with homepage display
```

#### 3. Enhanced Social Media Management
**Purpose**: Unified interface for managing both integration methods

**Key Features**:
- Toggle between Graph API and Page Plugin
- Unified configuration management
- Status monitoring and health checks
- Client onboarding assistance

## System Prompt for Implementation

### Phase 1: Infrastructure Setup

```
You are implementing Facebook integration infrastructure for Lawncha Libre. 
Follow these implementation steps:

**STEP 1: Update Dashboard Navigation**
- Add "Facebook Setup Wizard" tab to dashboard
- Add "Facebook Plugin Config" tab to dashboard
- Ensure proper user permissions and access control
- Update sidebar navigation with new options

**STEP 2: Implement Facebook App Setup Wizard**
- Create FacebookAppSetupWizard.tsx component
- Implement 5-step wizard: Developer Account → Create App → Configure → Get Credentials → Test
- Add interactive guidance with external links
- Implement credential validation and testing
- Integrate with existing credential storage system
- Add progress tracking and step navigation

**STEP 3: Implement Facebook Page Plugin**
- Create FacebookPagePlugin.tsx component
- Implement Facebook SDK loading and initialization
- Add responsive design support (desktop/mobile)
- Create configuration interface for plugin settings
- Add error handling and retry logic
- Implement preview functionality

**STEP 4: Update Social Media Management**
- Integrate both integration methods
- Add toggle between Graph API and Page Plugin
- Implement status monitoring for both methods
- Add client onboarding assistance
- Create unified configuration management

**STEP 5: Homepage Integration**
- Update homepage to support both integration methods
- Add fallback logic: Graph API → Page Plugin → Mock Data
- Implement responsive design for both methods
- Add loading states and error handling
- Ensure seamless user experience

**STEP 6: Database Schema Updates**
- Ensure facebookAppCredentials supports multiple clients
- Add plugin configuration storage
- Implement proper encryption for sensitive data
- Add validation and constraints
- Create indexes for efficient querying

**STEP 7: Security Implementation**
- Encrypt all Facebook app secrets
- Implement proper access controls
- Add audit logging for API calls
- Create secure credential storage
- Implement rate limiting and quota management

**STEP 8: Testing and Validation**
- Test both integration methods thoroughly
- Validate error handling and edge cases
- Test responsive design on multiple devices
- Verify security measures
- Test client onboarding flow
```

### Phase 2: Client Onboarding System

```
You are implementing the client onboarding system for Facebook integration.
Create a comprehensive onboarding experience:

**STEP 1: Create Onboarding Flow**
- Implement step-by-step wizard interface
- Add progress indicators and navigation
- Create interactive guidance with tooltips
- Add external links to Facebook Developer Console
- Implement credential validation and testing

**STEP 2: Add Help and Documentation**
- Create in-app help system with tooltips
- Add troubleshooting guides and FAQ
- Implement error messages with solutions
- Create video tutorials and screenshots
- Add live chat support integration

**STEP 3: Implement Validation System**
- Add real-time credential validation
- Test Facebook app permissions and access
- Verify page connection and data access
- Implement health checks and monitoring
- Add error reporting and diagnostics

**STEP 4: Create Support System**
- Implement support ticket system
- Add knowledge base and documentation
- Create client success metrics tracking
- Implement feedback collection system
- Add escalation procedures for complex issues

**STEP 5: Add Analytics and Monitoring**
- Track onboarding completion rates
- Monitor integration success rates
- Measure client satisfaction scores
- Track support ticket volume and resolution
- Implement performance monitoring
```

### Phase 3: Fallback and Alternative Methods

```
You are implementing fallback systems for Facebook integration.
Create robust fallback mechanisms:

**STEP 1: Implement Graceful Degradation**
- Graph API → Page Plugin → Mock Data → Error State
- Automatic fallback detection and switching
- User notification of fallback activation
- Seamless user experience across all states

**STEP 2: Create Alternative Content Sources**
- RSS feed integration for Facebook pages
- Manual content import tools
- Third-party service integrations
- Backup content storage and retrieval

**STEP 3: Implement Error Recovery**
- Automatic retry mechanisms
- Manual refresh and reconnect options
- Error state management and recovery
- User guidance for resolving issues

**STEP 4: Add Monitoring and Alerts**
- Real-time integration health monitoring
- Automated alert system for failures
- Performance metrics and reporting
- Client notification system for issues
```

## Configuration Management

### Environment Variables
```bash
# Facebook Integration
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_REDIRECT_URI=https://yourdomain.com/auth/facebook/callback

# Encryption
ENCRYPTION_MASTER_SECRET=your_encryption_secret

# Monitoring
FACEBOOK_API_MONITORING=true
FACEBOOK_RATE_LIMIT_MONITORING=true
```

### Database Configuration
```sql
-- Facebook App Credentials (per client)
CREATE TABLE facebookAppCredentials (
  id UUID PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  encryptedAppId TEXT NOT NULL,
  encryptedAppSecret TEXT NOT NULL,
  encryptedRedirectUri TEXT NOT NULL,
  appName VARCHAR(255),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Facebook Page Plugin Configuration
CREATE TABLE facebookPluginConfig (
  id UUID PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  pageUrl VARCHAR(500) NOT NULL,
  width INTEGER DEFAULT 340,
  height INTEGER DEFAULT 500,
  showHeader BOOLEAN DEFAULT true,
  showTabs JSON,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## Implementation Checklist

### Core Features
- [ ] Facebook App Setup Wizard
- [ ] Facebook Page Plugin Component
- [ ] Configuration Management Interface
- [ ] Homepage Integration
- [ ] Dashboard Navigation Updates
- [ ] Database Schema Updates
- [ ] Security Implementation
- [ ] Error Handling and Fallbacks

### Client Experience
- [ ] Step-by-step onboarding flow
- [ ] Interactive guidance and tooltips
- [ ] Credential validation and testing
- [ ] Help documentation and support
- [ ] Responsive design implementation
- [ ] Error recovery mechanisms

### Technical Implementation
- [ ] Facebook SDK integration
- [ ] Graph API integration
- [ ] Page Plugin implementation
- [ ] Encryption and security
- [ ] Monitoring and analytics
- [ ] Performance optimization
- [ ] Testing and validation

### Support and Maintenance
- [ ] Documentation creation
- [ ] Support system implementation
- [ ] Monitoring and alerting
- [ ] Performance tracking
- [ ] Client success metrics
- [ ] Troubleshooting guides

## Success Metrics

### Technical Metrics
- Integration success rate: >95%
- Setup completion rate: >80%
- Error resolution time: <24 hours
- System uptime: >99.9%

### Client Experience Metrics
- Client satisfaction score: >4.5/5
- Support ticket volume: <10% of clients
- Onboarding completion rate: >85%
- Feature adoption rate: >70%

### Business Metrics
- Client retention rate: >90%
- Revenue per client: Increase by 20%
- Support costs: Decrease by 30%
- Client acquisition: Increase by 25%

## Maintenance and Updates

### Regular Maintenance Tasks
1. Monitor Facebook API changes and updates
2. Update integration code as needed
3. Maintain security best practices
4. Regular testing and validation
5. Performance monitoring and optimization

### Client Support Tasks
1. Provide setup assistance and guidance
2. Troubleshoot integration issues
3. Monitor client success and satisfaction
4. Collect feedback and improve processes
5. Maintain documentation and resources

### Security and Compliance
1. Regular security audits and updates
2. Monitor for policy changes and compliance
3. Maintain encryption and access controls
4. Implement backup and recovery procedures
5. Regular staff training and awareness

This comprehensive system prompt provides the foundation for implementing a robust Facebook integration system that supports both primary and fallback methods while ensuring excellent client experience and technical reliability.
