import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { IntakeForm } from "./IntakeForm";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { AuthModal } from "./ui/modal";
import { ThemeToggle } from "./ui/theme-toggle";
import { BrandIdentity } from "./BrandIdentity";
import { useUser } from "@clerk/react";
import { 
  Calendar, 
  Users, 
  Star, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Leaf,
  Hammer,
  Wrench,
  Zap,
  ArrowRight,
  Quote,
  Info,
  Building2,
  Filter,
  Search,
  ChevronDown,
  Workflow,
  FolderKanban,
  Handshake
} from "lucide-react";

const DEFAULT_BRAND_NAME = "Atheca";
const DEFAULT_LOGO_SRC = "/atheca-logo-transparent.png";

const landingPageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Libre+Baskerville:wght@400;700&family=Courier+Prime:wght@400;700&family=Chivo:wght@400;500;700;800&family=Chivo+Mono:wght@400;500;700&family=JetBrains+Mono:wght@400;500;600;700&family=Archivo+Black&family=IBM+Plex+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&family=Azeret+Mono:wght@400;500;600;700&display=swap');
  .landing-page {
    background: var(--landing-page-background);
    background-image: var(--landing-page-texture);
    color: var(--landing-text);
    font-family: var(--landing-body-font);
  }
  .landing-page .landing-header {
    background: var(--landing-header-background);
    border-color: var(--landing-border);
    backdrop-filter: blur(14px);
  }
  .landing-page .landing-banner {
    background: var(--landing-banner-background);
    border-color: var(--landing-border);
    color: var(--landing-text);
  }
  .landing-page .landing-hero-shell,
  .landing-page .landing-card,
  .landing-page .landing-card-strong,
  .landing-page .landing-panel,
  .landing-page .landing-panel-strong,
  .landing-page .landing-style-chip,
  .landing-page .landing-filter {
    box-shadow: var(--landing-shadow);
  }
  .landing-page .landing-hero-shell {
    position: relative;
    background: var(--landing-surface);
    border: 1px solid var(--landing-border-strong);
    border-radius: var(--landing-radius);
    padding: clamp(2rem, 4vw, 3.5rem);
    overflow: hidden;
  }
  .landing-page .landing-hero-shell::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at top left, var(--landing-hero-glow-1), transparent 28%),
      radial-gradient(circle at bottom right, var(--landing-hero-glow-2), transparent 32%);
    pointer-events: none;
  }
  .landing-page .landing-hero-shell > * {
    position: relative;
    z-index: 1;
  }
  .landing-page .landing-display {
    font-family: var(--landing-display-font);
    color: var(--landing-text);
  }
  .landing-page .landing-section-title,
  .landing-page .landing-heading {
    font-family: var(--landing-display-font);
    color: var(--landing-text);
  }
  .landing-page .landing-accent-text {
    color: var(--landing-accent);
  }
  .landing-page .landing-muted-text {
    color: var(--landing-text-muted) !important;
  }
  .landing-page .landing-card,
  .landing-page .landing-card-strong,
  .landing-page .landing-panel,
  .landing-page .landing-panel-strong {
    border-radius: calc(var(--landing-radius) - 6px);
    border: 1px solid var(--landing-border);
    background: var(--landing-surface);
    color: var(--landing-text);
  }
  .landing-page .landing-card-strong,
  .landing-page .landing-panel-strong {
    background: var(--landing-surface-strong);
    border-color: var(--landing-border-strong);
  }
  .landing-page .landing-card:hover {
    background: var(--landing-card-hover);
  }
  .landing-page .landing-accent-badge {
    background: var(--landing-accent-soft);
    color: var(--landing-accent);
    border-radius: 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    font-size: 0.65rem;
  }
  .landing-page .landing-outline-badge {
    background: transparent;
    color: var(--landing-text-muted);
    border-color: var(--landing-border-strong);
    border-radius: 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.6rem;
  }
  .landing-page .landing-style-chip {
    border: 1px solid var(--landing-border);
    background: var(--landing-surface-strong);
    border-radius: 0;
    color: var(--landing-text);
    padding: 0.65rem 1rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.7rem;
  }
  .landing-page .landing-style-chip.is-active {
    background: var(--landing-accent);
    border-color: var(--landing-border-strong);
    color: var(--landing-button-text);
  }
  .landing-page .landing-button-primary {
    background: var(--landing-accent) !important;
    color: var(--landing-button-text) !important;
    border: 1px solid var(--landing-accent) !important;
    border-radius: 0 !important;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 700;
  }
  .landing-page .landing-button-primary:hover {
    background: var(--landing-accent-alt) !important;
  }
  .landing-page .landing-button-secondary {
    background: var(--landing-surface-strong) !important;
    color: var(--landing-text) !important;
    border: 1px solid var(--landing-border-strong) !important;
    border-radius: 0 !important;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .landing-page .landing-button-tertiary {
    color: var(--landing-text) !important;
    border-color: var(--landing-border) !important;
    border-radius: 0 !important;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .landing-page .landing-filter,
  .landing-page .landing-input {
    background: var(--landing-surface-strong) !important;
    border: 1px solid var(--landing-border) !important;
    color: var(--landing-text) !important;
    border-radius: 0 !important;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }
  .landing-page .landing-filter::placeholder,
  .landing-page .landing-input::placeholder {
    color: var(--landing-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .landing-page .landing-cta {
    background: var(--landing-cta-bg);
    color: var(--landing-text);
    border-top: 2px solid var(--landing-accent);
  }
  .landing-page .landing-footer {
    background: var(--landing-footer-bg);
    border-color: var(--landing-border);
    color: var(--landing-text);
  }
  html:not(.dark) .landing-page .landing-cta,
  html:not(.dark) .landing-page .landing-footer {
    --landing-text: #ede5d0;
    --landing-text-muted: #d6c89b;
    --landing-accent: #d6a03a;
    --landing-accent-soft: rgba(214,168,58,0.15);
    --landing-border: rgba(237,229,208,0.20);
  }
  @media (max-width: 768px) {
    .landing-page .landing-hero-shell {
      padding: 1.5rem;
    }
  }
`;

export function Homepage() {
  const { isSignedIn } = useUser();
  const displayBrandName = DEFAULT_BRAND_NAME;
  const displayLogoSrc = isSignedIn ? undefined : DEFAULT_LOGO_SRC;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  // Landing theme variables are now defined in index.css under :root and .dark

  // Fetch real showcase projects from the database
  const showcaseProjects = useQuery(api.facebookProjectPort.getShowcaseProjects, { limit: 50 });

  // Mock data for showcase
  const mockServices = [
    { icon: Hammer, name: "Remodeling", description: "Kitchens, baths, additions, and whole-home renovations" },
    { icon: Wrench, name: "Plumbing & mechanical", description: "Rough-in, fixtures, and HVAC coordination" },
    { icon: Zap, name: "Electrical", description: "Panels, lighting, and code-compliant installations" },
    { icon: Leaf, name: "Landscaping & outdoor", description: "Hardscapes, irrigation, planting, and outdoor living" }
  ];

  // Transform showcase projects to match the expected format
  const transformedProjects = showcaseProjects?.map((project: any) => ({
    id: project._id,
    projectName: project.projectName,
    projectType: project.projectType,
    businessName: project.businessProfile?.businessName || "General Contractor",
    clientName: "Client", // For showcase projects, we don't need specific client names
    status: "completed",
    estimatedLength: Math.ceil((project.actualEndDateTime - project.actualStartDateTime) / (24 * 60 * 60 * 1000)),
    imageUrl: project.imageUrls?.[0] || "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop",
    description: project.projectDescription || "Construction project completed by our team.",
    completedDate: new Date(project.actualEndDateTime).toISOString().split('T')[0],
    fullDescription: project.projectDescription || "This project showcases our expertise in residential and commercial construction.",
    tasks: project.projectTasks?.map((task: any) => task.name) || ["Project completed"],
    beforeImages: [],
    afterImages: project.imageUrls || [],
    clientTestimonial: "Excellent work by our contracting team!",
    budget: "Contact for pricing",
    facebookPostUrl: project.facebookPostUrl,
    isFromFacebookPost: project.isFromFacebookPost
  })) || [];

  // Mock project data for showcase (fallback if no real projects)
  const mockProjects = [
    {
      id: 1,
      projectName: "Kitchen & master bath remodel",
      projectType: "Residential remodel",
      businessName: "Apex Framework GC",
      clientName: "Sarah Johnson",
      status: "completed",
      estimatedLength: 21,
      imageUrl: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=400&h=300&fit=crop",
      description: "Full kitchen and primary bath renovation with new cabinets, finishes, and mechanical updates.",
      completedDate: "2024-01-15",
      fullDescription: "A whole-room renovation coordinated by a single GC: demolition, structural checks, plumbing and electrical rough-in, cabinetry install, tile and countertops, fixtures, paint, and punch-list walkthrough. The homeowner stayed informed with a clear schedule and trade coordination.",
      tasks: [
        "Design intake and scope lock",
        "Demolition and debris removal",
        "Plumbing and electrical rough-in",
        "Cabinet and countertop installation",
        "Tile, flooring, and trim",
        "Fixtures and appliances",
        "Final inspection and punch list"
      ],
      beforeImages: [
        "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=400&h=300&fit=crop"
      ],
      afterImages: [
        "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop"
      ],
      clientTestimonial: "Apex coordinated every trade and kept the job on track. Our kitchen and bath feel brand new.",
      budget: "$65,000 - $85,000"
    },
    {
      id: 2,
      projectName: "Office lobby & exterior refresh",
      projectType: "Commercial TI",
      businessName: "StructureFirst Builders",
      clientName: "Downtown Development Corp",
      status: "completed",
      estimatedLength: 12,
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
      description: "Tenant improvement for lobby, restrooms, and building entry with coordinated exterior updates.",
      completedDate: "2024-02-20",
      fullDescription: "A multi-phase commercial project: interior build-out of the lobby and restrooms, ADA compliance updates, new lighting and finishes, and exterior entry improvements including signage mounts and limited landscape at the approach. Scheduling minimized disruption to occupied floors.",
      tasks: [
        "Site logistics and safety plan",
        "Interior framing and finishes",
        "Restroom and ADA upgrades",
        "Lighting and low-voltage coordination",
        "Exterior entry and canopy work",
        "Limited landscape at building approach",
        "Final commissioning and closeout"
      ],
      beforeImages: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
      ],
      afterImages: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop"
      ],
      clientTestimonial: "StructureFirst delivered a polished lobby and entry on schedule. Communication with our property manager was excellent.",
      budget: "$180,000 - $240,000"
    },
    {
      id: 3,
      projectName: "Pool deck & outdoor living",
      projectType: "Outdoor / hardscape",
      businessName: "Summit Site Works",
      clientName: "Mike Rodriguez",
      status: "completed",
      estimatedLength: 8,
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
      description: "Pool surround, paving, pergola, and planting package under one general contractor.",
      completedDate: "2024-03-10",
      fullDescription: "Outdoor living scope: reinforced pool deck, drainage, paver layout, pergola and lighting, irrigation tie-in, and softscape for screening. One contract covered concrete, carpentry, electrical for fixtures, and landscape finish—typical GC coordination for exterior work.",
      tasks: [
        "Grading and drainage plan",
        "Pool deck and paver installation",
        "Pergola and exterior lighting",
        "Irrigation and planting",
        "Privacy screening",
        "Safety and code review",
        "Final landscape establishment"
      ],
      beforeImages: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop"
      ],
      afterImages: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop"
      ],
      clientTestimonial: "Summit handled hardscape, electrical, and planting without us juggling five different companies.",
      budget: "$48,000 - $62,000"
    },
    {
      id: 4,
      projectName: "Historic storefront restoration",
      projectType: "Restoration",
      businessName: "Heritage Build Partners",
      clientName: "Main Street Historic Society",
      status: "completed",
      estimatedLength: 15,
      imageUrl: "https://images.unsplash.com/photo-1464146072230-87357e5a6d5b?w=400&h=300&fit=crop",
      description: "Facade repair, window replication, and structural stabilization for a registered historic building.",
      completedDate: "2024-01-30",
      fullDescription: "Restoration-focused GC work: documentation with the preservation board, masonry repair, custom window fabrication to match originals, structural reinforcement, and period-appropriate finishes. Subcontractors were vetted for historic sensitivity.",
      tasks: [
        "Historic review and approvals",
        "Masonry and facade repair",
        "Custom window installation",
        "Structural stabilization",
        "Interior shell prep for tenant",
        "Walkthrough with preservation officer",
        "Warranty and maintenance briefing"
      ],
      beforeImages: [
        "https://images.unsplash.com/photo-1464146072230-87357e5a6d5b?w=400&h=300&fit=crop"
      ],
      afterImages: [
        "https://images.unsplash.com/photo-1464146072230-87357e5a6d5b?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop"
      ],
      clientTestimonial: "Heritage Build respected the original character and still brought the building up to modern code.",
      budget: "$210,000 - $275,000"
    },
    {
      id: 5,
      projectName: "Drought-tolerant landscape",
      projectType: "Landscaping",
      businessName: "EcoScape Solutions",
      clientName: "Green Living LLC",
      status: "completed",
      estimatedLength: 6,
      imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop",
      description: "Water-efficient design with native plantings—landscaping as part of a broader outdoor program.",
      completedDate: "2024-02-15",
      fullDescription: "Landscaping remains a core trade many GCs bundle with hardscape and irrigation. This project removed high-water turf, installed permeable paths, native beds, and efficient irrigation—often sequenced after hardscape by the same contractor team.",
      tasks: [
        "Water budget and plant palette",
        "Turf removal and soil prep",
        "Permeable path installation",
        "Native plant installation",
        "Irrigation upgrade",
        "Mulch and establishment watering plan",
        "Client care instructions"
      ],
      beforeImages: [
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop"
      ],
      afterImages: [
        "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop"
      ],
      clientTestimonial: "EcoScape cut our water bill and the yard still looks intentional and finished.",
      budget: "$18,000 - $28,000"
    },
    {
      id: 6,
      projectName: "Full roof replacement",
      projectType: "Roofing & exteriors",
      businessName: "RidgeTop Exteriors",
      clientName: "Urban Living Complex",
      status: "completed",
      estimatedLength: 10,
      imageUrl: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=300&fit=crop",
      description: "Tear-off, decking repairs, underlayment, and architectural shingles with new gutters and downspouts.",
      completedDate: "2024-03-05",
      fullDescription: "A weather-tight envelope project managed as a standalone GC contract: tear-off, substrate repairs, ice and water shield, shingle install, ventilation adjustments, and gutter replacement. Ideal for property managers who need documentation and warranty handoff.",
      tasks: [
        "Roof inspection and scope",
        "Tear-off and decking repair",
        "Underlayment and flashing",
        "Shingle installation",
        "Gutter and downspout replacement",
        "Cleanup and magnet sweep",
        "Manufacturer warranty registration"
      ],
      beforeImages: [
        "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=300&fit=crop"
      ],
      afterImages: [
        "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop"
      ],
      clientTestimonial: "RidgeTop kept residents informed and left the site clean every night. The new roof passed inspection first try.",
      budget: "$95,000 - $125,000"
    }
  ];

  // Extract unique business names for filter from real data
  const uniqueBusinesses = Array.from(new Set(
    transformedProjects.map((project: any) => project.businessName)
  ));

  // Use real projects if available, otherwise fall back to mock data
  const projectsToDisplay = transformedProjects.length > 0 ? transformedProjects : mockProjects;

  // Filter projects based on selected business and search term
  const filteredProjects = projectsToDisplay.filter((project: any) => {
    const matchesBusiness = selectedBusiness === "all" || project.businessName === selectedBusiness;
    const matchesSearch = project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.projectType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBusiness && matchesSearch;
  });

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const mockTestimonials = [
    {
      id: 1,
      client: "Sarah Johnson",
      rating: 5,
      title: "Smooth kitchen remodel",
      description: `${displayBrandName} helped us line up a great contractor for our kitchen. Clear updates, realistic timeline, and the crew showed up when they said they would.`,
      highlighted: true
    },
    {
      id: 2,
      client: "Mike Chen",
      rating: 5,
      title: "Commercial job done right",
      description: "We used the platform for a lobby refresh at our building. Bids were easy to compare and the GC we picked handled TI and exterior details without drama.",
      highlighted: false
    },
    {
      id: 3,
      client: "Emily Rodriguez",
      rating: 4,
      title: "Outdoor project, one point of contact",
      description: "Pool deck and plantings were coordinated together—no more guessing which subcontractor was next. Fair pricing and solid cleanup.",
      highlighted: true
    }
  ];

  const mockAppointments = [
    { date: "Dec 28", time: "9:00 AM", type: "Consultation", status: "available" },
    { date: "Dec 28", time: "11:00 AM", type: "Site Visit", status: "booked" },
    { date: "Dec 29", time: "2:00 PM", type: "Consultation", status: "available" },
    { date: "Dec 30", time: "10:00 AM", type: "Follow-up", status: "available" }
  ];

  const faqs = [
    {
      question: "Do I need an account to request a quote?",
      answer:
        "No. The quote intake form on this page works without signing in. You can submit your contact info, project details, and optional media first, then create an account later if you want to continue inside the platform.",
    },
    {
      question: "What happens after I submit a quote request?",
      answer:
        "Your request is stored as an intake form with a submitted status. A business owner can claim it, add notes and an estimated quote, and convert it into a tracked project when moving forward.",
    },
    {
      question: "Can I upload photos or videos with my request?",
      answer:
        "Yes. The intake form supports both images and videos so contractors can review scope before responding. The current form accepts up to 10 files with per-file size limits.",
    },
    {
      question: "How are clients involved before work starts?",
      answer:
        "Projects can require client approval when the project is linked to a client account. Linked clients can approve or reject pending projects before execution begins.",
    },
    {
      question: "Can teams (owners + employees) work in the same project?",
      answer:
        "Yes. Business owners can assign employees to projects. Assigned employees can update task progress and project images, while project-level controls remain with the business owner.",
    },
    {
      question: "Is everything on this landing page live production data?",
      answer:
        "Not all of it. This page is explicitly labeled Demo Mode, and many sections are mocked for demonstration. The platform itself supports real quotes, appointments, projects, and testimonials once users are signed in.",
    },
  ];

  return (
    <>
      <style>{landingPageCss}</style>
      <div className="landing-page min-h-screen transition-colors duration-300">
      {/* Header with Theme Toggle */}
      <header className="landing-header sticky top-0 z-50 border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <BrandIdentity
            className="min-w-0"
            logoClassName="h-10 w-10 sm:h-12 sm:w-12"
            nameClassName="landing-heading text-xl sm:text-2xl font-bold truncate"
            taglineClassName="landing-muted-text text-xs sm:text-sm"
            brandName={displayBrandName}
            logoSrc={displayLogoSrc}
            showTagline
          />
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Demo Mode Banner */}
      <div className="landing-banner border-b py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <Info className="h-5 w-5 flex-shrink-0 animate-pulse-glow" />
          <p className="text-sm md:text-base font-medium">
            Demo Mode: All data shown on this page is mocked for demonstration purposes
          </p>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="landing-hero-shell text-center">
          <h1 className="landing-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in leading-tight">
            Built for Tradies,
            <span className="landing-accent-text block">made for Customers</span>
          </h1>
          <p className="landing-muted-text text-xl mb-8 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
            Connect homeowners and businesses with trusted contractors—or run your remodeling, trades, and landscaping jobs from one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Button 
              size="xl" 
              variant="default"
              onClick={() => setShowIntakeModal(true)}
              className="landing-button-primary px-8 py-4 animate-pulse-glow"
            >
              <Quote className="mr-2 h-5 w-5" />
              Get Free Quote
            </Button>
            <Button 
              size="xl" 
              variant="outline"
              onClick={() => {
                setAuthMode("signin");
                setShowAuthModal(true);
              }}
              className="landing-button-secondary px-8 py-4"
            >
              Sign In / Sign Up
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="xl" 
              variant="ghost"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="landing-button-tertiary px-8 py-4 hover:scale-105"
            >
              Learn More
            </Button>
          </div>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="landing-section-title text-4xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockServices.map((service, index) => (
              <Card 
                key={index} 
                variant="flat" 
                className="landing-card text-center group hover:scale-105 transition-all duration-300 animate-fade-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardContent className="p-6">
                  <div className="relative">
                    <service.icon className="h-12 w-12 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 landing-accent-text" />
                    <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "var(--landing-accent-soft)" }}></div>
                  </div>
                  <h3 className="landing-heading font-semibold mb-2">{service.name}</h3>
                  <p className="landing-muted-text text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* App flow: quotes, clients, and projects */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="landing-accent-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Workflow className="h-4 w-4" />
              How the platform fits together
            </div>
            <h2 className="landing-section-title text-4xl font-bold mb-4">From quotes and clients to live projects</h2>
            <p className="landing-muted-text max-w-2xl mx-auto text-lg">
              Quote requests are stored as intake forms. Businesses claim them, add an estimate, then convert the work into a project.
              You can also start a project for a client you already have from a booking or your client list.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="landing-panel relative p-6">
              <div className="flex items-center gap-2 mb-4">
                <Quote className="landing-accent-text h-6 w-6" />
                <h3 className="landing-heading text-lg font-semibold">Quote request → project</h3>
              </div>
              <ol className="space-y-4">
                {[
                  { step: "1", title: "Client submits intake", body: "The public form creates a quote request with contact info, description, and optional photos or videos." },
                  { step: "2", title: "Business claims & quotes", body: "An owner claims the request, adds notes, and can record an estimated price for the prospect." },
                  { step: "3", title: "Convert to project", body: "From the claimed request, the owner defines tasks, schedule, and scope. Media from the intake comes along; when the client has an account, they are tied to the project for approval." },
                ].map((item) => (
                  <li key={item.step} className="flex gap-3">
                    <span className="landing-accent-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      {item.step}
                    </span>
                    <div>
                      <p className="landing-heading font-medium">{item.title}</p>
                      <p className="landing-muted-text text-sm mt-0.5">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="landing-panel-strong relative p-6">
              <div className="flex items-center gap-2 mb-4">
                <Handshake className="h-6 w-6" style={{ color: "var(--landing-accent-alt)" }} />
                <h3 className="landing-heading text-lg font-semibold">Known client → project</h3>
              </div>
              <ol className="space-y-4">
                {[
                  { step: "A", title: "After a booking", body: "When a client books an available slot, you can spin up a project from that appointment with their account already attached." },
                  { step: "B", title: "From your dashboard", body: "Create a new project and choose a client you already work with—or mark work as historical with no linked client." },
                  { step: "C", title: "Same project record", body: "Either path uses the same project model: tasks, dates, status, and client approval when the client is on the platform." },
                ].map((item) => (
                  <li key={item.step} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: "var(--landing-accent-soft)", color: "var(--landing-accent-alt)" }}>
                      {item.step}
                    </span>
                    <div>
                      <p className="landing-heading font-medium">{item.title}</p>
                      <p className="landing-muted-text text-sm mt-0.5">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 mb-6">
            <ChevronDown className="h-7 w-7 text-primary" aria-hidden />
            <span className="landing-muted-text text-xs font-medium uppercase tracking-wide">Both paths converge</span>
          </div>

          <div className="landing-panel-strong p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-stretch md:justify-between gap-6">
              <div className="landing-card-strong flex-1 flex flex-col items-center text-center p-4 rounded-xl">
                <FolderKanban className="landing-accent-text h-10 w-10 mb-2" />
                <p className="landing-heading font-semibold">Project</p>
                <p className="landing-muted-text text-sm mt-1">Planned scope, task list, timeline, and notes in one place.</p>
              </div>
              <div className="landing-muted-text hidden md:flex items-center justify-center">
                <ArrowRight className="h-6 w-6" />
              </div>
              <div className="landing-muted-text flex md:hidden justify-center">
                <ChevronDown className="h-6 w-6" />
              </div>
              <div className="landing-card-strong flex-1 flex flex-col items-center text-center p-4 rounded-xl">
                <Users className="landing-accent-text h-10 w-10 mb-2" />
                <p className="landing-heading font-semibold">Client approval</p>
                <p className="landing-muted-text text-sm mt-1">Linked clients review pending projects; then work moves forward with full visibility.</p>
              </div>
              <div className="landing-muted-text hidden md:flex items-center justify-center">
                <ArrowRight className="h-6 w-6" />
              </div>
              <div className="landing-muted-text flex md:hidden justify-center">
                <ChevronDown className="h-6 w-6" />
              </div>
              <div className="landing-card-strong flex-1 flex flex-col items-center text-center p-4 rounded-xl">
                <CheckCircle className="landing-accent-text h-10 w-10 mb-2" />
                <p className="landing-heading font-semibold">Delivery & completion</p>
                <p className="landing-muted-text text-sm mt-1">Track tasks through the queue, run the job, and mark the project complete.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="landing-section-title text-4xl font-bold text-center mb-12">Featured Projects</h2>
          
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="landing-muted-text absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="landing-filter w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="landing-muted-text h-4 w-4" />
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="landing-filter px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
              >
                <option value="all">All Businesses</option>
                {uniqueBusinesses.map((business) => (
                  <option key={business} value={business}>{business}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any, index: number) => (
              <Card 
                key={project.id} 
                variant="flat"
                className="landing-card group transition-all duration-300 animate-fade-in overflow-hidden cursor-pointer"
                style={{animationDelay: `${index * 0.1}s`}}
                onClick={() => handleProjectClick(project)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={project.imageUrl} 
                    alt={project.projectName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="border-0 text-white" style={{ background: "var(--landing-accent)" }}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="landing-heading font-semibold text-lg transition-colors">
                      {project.projectName}
                    </h3>
                    <Badge variant="outline" className="landing-outline-badge text-xs">
                      {project.projectType}
                    </Badge>
                  </div>
                  
                  <p className="landing-muted-text text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="landing-muted-text space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{project.businessName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{project.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{project.estimatedLength} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="landing-muted-text mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="landing-heading text-lg font-medium mb-2">No projects found</h3>
              <p className="landing-muted-text">
                Try adjusting your search terms or filter criteria
              </p>
            </div>
          )}

          <div className="text-center mt-8">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                setAuthMode("signin");
                setShowAuthModal(true);
              }}
              className="landing-button-secondary px-8"
            >
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="landing-section-title text-4xl font-bold text-center mb-12">Platform Features</h2>
          
          {/* Appointment Booking Demo */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="animate-fade-in">
              <h3 className="landing-heading text-2xl font-semibold mb-4 flex items-center">
                <Calendar className="landing-accent-text h-6 w-6 mr-2" />
                Smart Appointment Booking
              </h3>
              <p className="landing-muted-text mb-6">
                Clients can easily view available time slots and book appointments with your team. 
                Business owners can manage their calendar and availability in real-time.
              </p>
              <div className="space-y-2">
                <p className="landing-heading text-sm font-medium">Available Appointments:</p>
                {mockAppointments.map((apt, index) => (
                  <div key={index} className="landing-card flex items-center justify-between p-3 rounded-lg animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-center gap-3">
                      <Clock className="landing-muted-text h-4 w-4" />
                      <span className="landing-heading font-medium">{apt.date}</span>
                      <span className="landing-muted-text">{apt.time}</span>
                      <Badge variant="outline">{apt.type}</Badge>
                    </div>
                    <Badge variant={apt.status === 'available' ? 'default' : 'secondary'}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <Card variant="flat" className="landing-card p-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h4 className="landing-heading font-semibold mb-4">Book an Appointment</h4>
              <div className="space-y-4">
                <div>
                  <label className="landing-heading block text-sm font-medium mb-1">Service Type</label>
                  <select className="landing-filter w-full p-2 rounded-md">
                    <option>Consultation</option>
                    <option>Site Visit</option>
                    <option>Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="landing-heading block text-sm font-medium mb-1">Preferred Date</label>
                  <input type="date" className="landing-filter w-full p-2 rounded-md" />
                </div>
                <Button className="landing-button-primary w-full" variant="default" disabled>
                  Book Appointment (Demo)
                </Button>
              </div>
            </Card>
          </div>

          {/* Project Management Demo */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <Card variant="flat" className="landing-card p-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <h4 className="landing-heading font-semibold mb-4">Active Projects</h4>
              <div className="space-y-3">
                {mockProjects.map((project, index) => (
                  <div key={project.id} className="landing-card-strong p-4 rounded-lg animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="landing-heading font-medium">{project.projectName}</h5>
                      <Badge variant={
                        project.status === 'completed' ? 'default' : 
                        project.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="landing-muted-text text-sm mb-1">Type: {project.projectType}</p>
                    <p className="landing-muted-text text-sm mb-1">Duration: {project.estimatedLength} days</p>
                    <p className="landing-muted-text text-sm">Client: {project.clientName}</p>
                  </div>
                ))}
              </div>
            </Card>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h3 className="landing-heading text-2xl font-semibold mb-4 flex items-center">
                <CheckCircle className="landing-accent-text h-6 w-6 mr-2" />
                Project Management
              </h3>
              <p className="landing-muted-text mb-6">
                Business owners can create, track, and manage projects from estimate through punch list—
                remodels, trades, exteriors, and outdoor work. Keep clients informed with real-time updates.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="landing-accent-text h-4 w-4" />
                  <span className="landing-muted-text text-sm">Create detailed project plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="landing-accent-text h-4 w-4" />
                  <span className="landing-muted-text text-sm">Track project progress and milestones</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="landing-accent-text h-4 w-4" />
                  <span className="landing-muted-text text-sm">Manage timelines and deadlines</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="landing-accent-text h-4 w-4" />
                  <span className="landing-muted-text text-sm">Client communication and updates</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quote Request Feature */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="animate-fade-in">
              <h3 className="landing-heading text-2xl font-semibold mb-4 flex items-center">
                <Quote className="landing-accent-text h-6 w-6 mr-2" />
                Easy Quote Requests
              </h3>
              <p className="landing-muted-text mb-6">
                Planning a repair, remodel, or outdoor project? Fill out our intake form with your details, 
                and we'll connect you with qualified contractors who can provide competitive quotes.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="landing-accent-text h-4 w-4" />
                  <span className="landing-muted-text text-sm">Free quote requests</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="landing-accent-text h-4 w-4" />
                  <span className="landing-muted-text text-sm">Upload project photos and videos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="landing-accent-text h-4 w-4" />
                  <span className="landing-muted-text text-sm">Multiple quotes from verified professionals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="landing-accent-text h-4 w-4" />
                  <span className="landing-muted-text text-sm">No obligation to accept any quotes</span>
                </li>
              </ul>
            </div>
            <Card variant="flat" className="landing-card p-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h4 className="landing-heading font-semibold mb-4">Ready to Get Started?</h4>
              <p className="landing-muted-text text-sm mb-4">
                Submit your project details and receive quotes from qualified contractors in your area.
              </p>
              <Button 
                onClick={() => setShowIntakeModal(true)}
                className="landing-button-primary w-full"
                variant="default"
              >
                <Quote className="mr-2 h-4 w-4" />
                Request Free Quote
              </Button>
              <p className="landing-muted-text text-xs mt-2 text-center">
                Takes less than 5 minutes
              </p>
            </Card>
          </div>

          {/* Testimonials Demo */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="animate-fade-in">
              <h3 className="landing-heading text-2xl font-semibold mb-4 flex items-center">
                <Star className="landing-accent-text h-6 w-6 mr-2" />
                Customer Reviews & Testimonials
              </h3>
              <p className="landing-muted-text mb-6">
                Build trust with potential clients through authentic customer reviews.
                Business owners can highlight their best testimonials to showcase their expertise.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="landing-muted-text text-sm">5-star rating system</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="landing-muted-text text-sm">Detailed written reviews</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="landing-muted-text text-sm">Highlight featured testimonials</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="landing-muted-text text-sm">Project-specific feedback</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              {mockTestimonials.map((testimonial, index) => (
                <Card 
                  key={testimonial.id} 
                  variant="flat"
                  className={`landing-card ${testimonial.highlighted ? 'ring-2 ring-yellow-400/50' : ''} animate-fade-in`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        {testimonial.highlighted && (
                          <Badge variant="secondary" className="text-xs">Featured</Badge>
                        )}
                      </div>
                    </div>
                    <h4 className="landing-heading font-semibold text-sm mb-1">{testimonial.title}</h4>
                    <p className="landing-muted-text text-sm mb-2">{testimonial.description}</p>
                    <p className="landing-muted-text text-xs">- {testimonial.client}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="landing-section-title text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="landing-muted-text text-lg">
              Quick answers about how quotes, projects, and collaboration work in {displayBrandName}.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={faq.question}
                variant="flat"
                className="landing-card animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="landing-heading text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="landing-muted-text leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta py-16 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="landing-heading text-4xl font-bold mb-4 animate-fade-in">Ready to Get Started?</h2>
          <p className="landing-muted-text text-xl mb-8 opacity-90 animate-fade-in" style={{animationDelay: '0.2s'}}>
            Join {displayBrandName} today and transform how you manage contracting work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Button 
              size="xl" 
              variant="outline"
              onClick={() => {
                setAuthMode("signup");
                setShowAuthModal(true);
              }}
              className="landing-button-secondary px-8 py-4"
            >
              Sign Up as Business Owner
            </Button>
            <Button 
              size="xl" 
              variant="outline"
              onClick={() => {
                setAuthMode("signup");
                setShowAuthModal(true);
              }}
              className="landing-button-secondary px-8 py-4"
            >
              Sign Up as Client
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer py-12 px-4 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <BrandIdentity
                logoClassName="h-12 w-12"
                nameClassName="landing-heading text-2xl font-bold"
                taglineClassName="landing-muted-text text-xs"
                className="mb-4"
                brandName={displayBrandName}
                logoSrc={displayLogoSrc}
                showTagline
              />
              <p className="landing-muted-text text-sm">
                Quotes, scheduling, and project management for general contractors and the clients who hire them.
              </p>
            </div>
            <div>
              <h4 className="landing-heading font-semibold mb-4">Services</h4>
              <ul className="landing-muted-text space-y-2 text-sm">
                <li>Remodeling & additions</li>
                <li>Electrical & plumbing</li>
                <li>Roofing & exteriors</li>
                <li>Landscaping & outdoor</li>
              </ul>
            </div>
            <div>
              <h4 className="landing-heading font-semibold mb-4">Platform</h4>
              <ul className="landing-muted-text space-y-2 text-sm">
                <li>Appointment Booking</li>
                <li>Project Management</li>
                <li>Customer Reviews</li>
                <li>Business Dashboard</li>
              </ul>
            </div>
            <div>
              <h4 className="landing-heading font-semibold mb-4">Contact</h4>
              <div className="landing-muted-text space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>info@atheca.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Your City, State</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 text-center text-sm landing-muted-text" style={{ borderTop: "1px solid var(--landing-border)" }}>
            <p>&copy; 2026 {displayBrandName}. All rights reserved. | <span className="landing-accent-text">Demo data shown for illustration purposes.</span></p>
          </div>
        </div>
      </footer>

      {/* Intake Form Modal */}
      <Dialog open={showIntakeModal} onOpenChange={setShowIntakeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Get Your Free Quote</DialogTitle>
            <DialogDescription className="text-center">
              Fill out the form below and we'll connect you with qualified contractors
            </DialogDescription>
          </DialogHeader>
          <IntakeForm 
            onSuccess={() => setShowIntakeModal(false)}
            onCancel={() => setShowIntakeModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      {/* Project Details Modal */}
      <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <div className="space-y-6">
              {/* Project Header */}
              <div className="text-center">
                <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {selectedProject.projectName}
                </DialogTitle>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <Badge variant="outline">{selectedProject.projectType}</Badge>
                  <span>•</span>
                  <span>{selectedProject.estimatedLength} days</span>
                  <span>•</span>
                  <span>Completed {selectedProject.completedDate}</span>
                </div>
              </div>

              {/* Main Image */}
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img 
                  src={selectedProject.imageUrl} 
                  alt={selectedProject.projectName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed Project
                  </Badge>
                </div>
              </div>

              {/* Project Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Business & Client Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{selectedProject.businessName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">General contractor</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{selectedProject.clientName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{selectedProject.estimatedLength} days</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Project Duration</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-primary">{selectedProject.budget}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Project Budget</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Client Testimonial */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Client Testimonial
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="text-gray-700 dark:text-gray-300 italic">
                        "{selectedProject.clientTestimonial}"
                      </blockquote>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                        — {selectedProject.clientName}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Project Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {selectedProject.fullDescription}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Project Tasks */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Work Performed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedProject.tasks.map((task: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  variant="outline"
                  onClick={() => setShowProjectModal(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowProjectModal(false);
                    setShowIntakeModal(true);
                  }}
                >
                  <Quote className="h-4 w-4 mr-2" />
                  Get Similar Quote
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}
