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

export function Homepage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

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
      description: "Buildcha Libre helped us line up a great contractor for our kitchen. Clear updates, realistic timeline, and the crew showed up when they said they would.",
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

  if (showAuthModal) {
    return (
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header with Theme Toggle */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold gradient-text">Buildcha Libre</h2>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Demo Mode Banner */}
      <div className="bg-yellow-100 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <Info className="h-5 w-5 flex-shrink-0 animate-pulse-glow" />
          <p className="text-sm md:text-base font-medium">
            Demo Mode: All data shown on this page is mocked for demonstration purposes
          </p>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-violet-500/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 animate-fade-in">
            General Contracting
            <span className="gradient-text block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
            Connect homeowners and businesses with trusted contractors—or run your remodeling, trades, and landscaping jobs from one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Button 
              size="xl" 
              variant="gradient"
              onClick={() => setShowIntakeModal(true)}
              className="px-8 py-4 animate-pulse-glow"
            >
              <Quote className="mr-2 h-5 w-5" />
              Get Free Quote
            </Button>
            <Button 
              size="xl" 
              variant="glass"
              onClick={() => {
                setAuthMode("signin");
                setShowAuthModal(true);
              }}
              className="px-8 py-4"
            >
              Sign In / Sign Up
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="xl" 
              variant="ghost"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 hover:scale-105"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockServices.map((service, index) => (
              <Card 
                key={index} 
                variant="elevated" 
                className="text-center group hover:scale-105 transition-all duration-300 animate-fade-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardContent className="p-6">
                  <div className="relative">
                    <service.icon className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{service.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* App flow: quotes, clients, and projects */}
      <section id="how-it-works" className="py-16 px-4 bg-gradient-to-b from-emerald-50/80 via-white/60 to-cyan-50/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 border-y border-emerald-100/80 dark:border-gray-700/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Workflow className="h-4 w-4" />
              How the platform fits together
            </div>
            <h2 className="text-4xl font-bold mb-4 gradient-text">From quotes and clients to live projects</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
              Quote requests are stored as intake forms. Businesses claim them, add an estimate, then convert the work into a project.
              You can also start a project for a client you already have from a booking or your client list.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="relative rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-white/70 dark:bg-gray-800/70 p-6 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Quote className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quote request → project</h3>
              </div>
              <ol className="space-y-4">
                {[
                  { step: "1", title: "Client submits intake", body: "The public form creates a quote request with contact info, description, and optional photos or videos." },
                  { step: "2", title: "Business claims & quotes", body: "An owner claims the request, adds notes, and can record an estimated price for the prospect." },
                  { step: "3", title: "Convert to project", body: "From the claimed request, the owner defines tasks, schedule, and scope. Media from the intake comes along; when the client has an account, they are tied to the project for approval." },
                ].map((item) => (
                  <li key={item.step} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                      {item.step}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="relative rounded-2xl border border-violet-200/80 dark:border-violet-900/50 bg-white/70 dark:bg-gray-800/70 p-6 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Handshake className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Known client → project</h3>
              </div>
              <ol className="space-y-4">
                {[
                  { step: "A", title: "After a booking", body: "When a client books an available slot, you can spin up a project from that appointment with their account already attached." },
                  { step: "B", title: "From your dashboard", body: "Create a new project and choose a client you already work with—or mark work as historical with no linked client." },
                  { step: "C", title: "Same project record", body: "Either path uses the same project model: tasks, dates, status, and client approval when the client is on the platform." },
                ].map((item) => (
                  <li key={item.step} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50 text-sm font-bold text-violet-800 dark:text-violet-200">
                      {item.step}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 mb-6">
            <ChevronDown className="h-7 w-7 text-primary" aria-hidden />
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Both paths converge</span>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-6 md:p-8 shadow-md max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-stretch md:justify-between gap-6">
              <div className="flex-1 flex flex-col items-center text-center p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50">
                <FolderKanban className="h-10 w-10 text-primary mb-2" />
                <p className="font-semibold text-gray-900 dark:text-gray-100">Project</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Planned scope, task list, timeline, and notes in one place.</p>
              </div>
              <div className="hidden md:flex items-center justify-center text-gray-300 dark:text-gray-600">
                <ArrowRight className="h-6 w-6" />
              </div>
              <div className="flex md:hidden justify-center text-gray-300 dark:text-gray-600">
                <ChevronDown className="h-6 w-6" />
              </div>
              <div className="flex-1 flex flex-col items-center text-center p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50">
                <Users className="h-10 w-10 text-primary mb-2" />
                <p className="font-semibold text-gray-900 dark:text-gray-100">Client approval</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Linked clients review pending projects; then work moves forward with full visibility.</p>
              </div>
              <div className="hidden md:flex items-center justify-center text-gray-300 dark:text-gray-600">
                <ArrowRight className="h-6 w-6" />
              </div>
              <div className="flex md:hidden justify-center text-gray-300 dark:text-gray-600">
                <ChevronDown className="h-6 w-6" />
              </div>
              <div className="flex-1 flex flex-col items-center text-center p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50">
                <CheckCircle className="h-10 w-10 text-primary mb-2" />
                <p className="font-semibold text-gray-900 dark:text-gray-100">Delivery & completion</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track tasks through the queue, run the job, and mark the project complete.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="py-16 px-4 bg-gradient-to-b from-white/30 dark:from-gray-800/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Featured Projects</h2>
          
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="group hover:shadow-lg transition-all duration-300 animate-fade-in overflow-hidden cursor-pointer"
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
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                      {project.projectName}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {project.projectType}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
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
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No projects found</h3>
              <p className="text-gray-600 dark:text-gray-400">
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
              className="px-8"
            >
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-gradient-to-b from-transparent to-white/30 dark:to-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Platform Features</h2>
          
          {/* Appointment Booking Demo */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="animate-fade-in">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <Calendar className="h-6 w-6 text-primary mr-2" />
                Smart Appointment Booking
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Clients can easily view available time slots and book appointments with your team. 
                Business owners can manage their calendar and availability in real-time.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Appointments:</p>
                {mockAppointments.map((apt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 glass rounded-lg border-white/20 dark:border-white/10 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">{apt.date}</span>
                      <span className="text-gray-600 dark:text-gray-400">{apt.time}</span>
                      <Badge variant="outline">{apt.type}</Badge>
                    </div>
                    <Badge variant={apt.status === 'available' ? 'default' : 'secondary'}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <Card variant="glass" className="p-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Book an Appointment</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Service Type</label>
                  <select className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <option>Consultation</option>
                    <option>Site Visit</option>
                    <option>Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Preferred Date</label>
                  <input type="date" className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                </div>
                <Button className="w-full" variant="gradient" disabled>
                  Book Appointment (Demo)
                </Button>
              </div>
            </Card>
          </div>

          {/* Project Management Demo */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <Card variant="glass" className="p-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Active Projects</h4>
              <div className="space-y-3">
                {mockProjects.map((project, index) => (
                  <div key={project.id} className="p-4 glass rounded-lg border-white/20 dark:border-white/10 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">{project.projectName}</h5>
                      <Badge variant={
                        project.status === 'completed' ? 'default' : 
                        project.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type: {project.projectType}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration: {project.estimatedLength} days</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Client: {project.clientName}</p>
                  </div>
                ))}
              </div>
            </Card>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 text-primary mr-2" />
                Project Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Business owners can create, track, and manage projects from estimate through punch list—
                remodels, trades, exteriors, and outdoor work. Keep clients informed with real-time updates.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Create detailed project plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Track project progress and milestones</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Manage timelines and deadlines</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Client communication and updates</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quote Request Feature */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="animate-fade-in">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <Quote className="h-6 w-6 text-primary mr-2" />
                Easy Quote Requests
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Planning a repair, remodel, or outdoor project? Fill out our intake form with your details, 
                and we'll connect you with qualified contractors who can provide competitive quotes.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Free quote requests</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Upload project photos and videos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Multiple quotes from verified professionals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">No obligation to accept any quotes</span>
                </li>
              </ul>
            </div>
            <Card variant="glass" className="p-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Ready to Get Started?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Submit your project details and receive quotes from qualified contractors in your area.
              </p>
              <Button 
                onClick={() => setShowIntakeModal(true)}
                className="w-full"
                variant="gradient"
              >
                <Quote className="mr-2 h-4 w-4" />
                Request Free Quote
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Takes less than 5 minutes
              </p>
            </Card>
          </div>

          {/* Testimonials Demo */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="animate-fade-in">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <Star className="h-6 w-6 text-primary mr-2" />
                Customer Reviews & Testimonials
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Build trust with potential clients through authentic customer reviews. 
                Business owners can highlight their best testimonials to showcase their expertise.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">5-star rating system</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Detailed written reviews</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Highlight featured testimonials</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Project-specific feedback</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              {mockTestimonials.map((testimonial, index) => (
                <Card 
                  key={testimonial.id} 
                  variant={testimonial.highlighted ? "elevated" : "glass"}
                  className={`${testimonial.highlighted ? 'ring-2 ring-yellow-400/50' : ''} animate-fade-in`}
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
                    <h4 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">{testimonial.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{testimonial.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">- {testimonial.client}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 gradient-bg text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 via-transparent to-violet-500/20"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4 animate-fade-in">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 animate-fade-in" style={{animationDelay: '0.2s'}}>
            Join Buildcha Libre today and transform how you manage contracting work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Button 
              size="xl" 
              variant="secondary"
              onClick={() => {
                setAuthMode("signup");
                setShowAuthModal(true);
              }}
              className="px-8 py-4 bg-white text-primary hover:bg-gray-100"
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
              className="px-8 py-4 bg-transparent text-white border-2 border-white hover:bg-white hover:text-primary"
            >
              Sign Up as Client
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 py-12 px-4 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold gradient-text mb-4">Buildcha Libre</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Quotes, scheduling, and project management for general contractors and the clients who hire them.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Services</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Remodeling & additions</li>
                <li>Electrical & plumbing</li>
                <li>Roofing & exteriors</li>
                <li>Landscaping & outdoor</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Appointment Booking</li>
                <li>Project Management</li>
                <li>Customer Reviews</li>
                <li>Business Dashboard</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Contact</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>info@buildchalibre.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Your City, State</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2026 Buildcha Libre. All rights reserved. | <span className="gradient-text">Demo data shown for illustration purposes.</span></p>
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
  );
}
