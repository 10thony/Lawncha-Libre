import { useState } from "react";
import { SignInForm } from "../SignInForm";
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
  Scissors,
  TreePine,
  Flower,
  ArrowRight,
  Quote,
  Info
} from "lucide-react";

export function Homepage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  // Mock data for showcase
  const mockServices = [
    { icon: Leaf, name: "Lawn Care", description: "Professional lawn maintenance and fertilization" },
    { icon: Scissors, name: "Hedge Trimming", description: "Precision pruning and shaping services" },
    { icon: TreePine, name: "Tree Services", description: "Tree removal, pruning, and planting" },
    { icon: Flower, name: "Garden Design", description: "Custom landscape design and installation" }
  ];

  const mockTestimonials = [
    {
      id: 1,
      client: "Sarah Johnson",
      rating: 5,
      title: "Exceptional Garden Transformation",
      description: "DoneRight Landscaping TX completely transformed our backyard into a beautiful oasis. The team was professional, punctual, and exceeded our expectations.",
      highlighted: true
    },
    {
      id: 2,
      client: "Mike Chen",
      rating: 5,
      title: "Reliable Lawn Care Service",
      description: "Been using their weekly lawn service for 6 months. Always on time, great communication, and my lawn has never looked better.",
      highlighted: false
    },
    {
      id: 3,
      client: "Emily Rodriguez",
      rating: 4,
      title: "Professional Tree Removal",
      description: "Quick and safe removal of a large oak tree. Clean up was thorough and pricing was fair. Would definitely recommend.",
      highlighted: true
    }
  ];

  const mockProjects = [
    {
      id: 1,
      name: "Residential Garden Makeover",
      type: "Landscape Design",
      status: "completed",
      duration: "2 weeks",
      client: "The Smiths"
    },
    {
      id: 2,
      name: "Commercial Lawn Maintenance",
      type: "Ongoing Maintenance",
      status: "in_progress",
      duration: "Ongoing",
      client: "Downtown Office Complex"
    },
    {
      id: 3,
      name: "Backyard Patio Installation",
      type: "Hardscaping",
      status: "planned",
      duration: "1 week",
      client: "Johnson Family"
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
          <h2 className="text-xl font-semibold gradient-text">DoneRight Landscaping TX</h2>
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
            Professional Landscaping
            <span className="gradient-text block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
            Connect with trusted landscaping professionals or manage your landscaping business with our comprehensive platform.
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
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
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
                Clients can easily view available time slots and book appointments with landscaping professionals. 
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
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">{project.name}</h5>
                      <Badge variant={
                        project.status === 'completed' ? 'default' : 
                        project.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type: {project.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration: {project.duration}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Client: {project.client}</p>
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
                Business owners can create, track, and manage landscaping projects from initial consultation 
                to completion. Keep clients informed with real-time updates and progress tracking.
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
                Need landscaping work done? Simply fill out our intake form with your project details, 
                and we'll connect you with qualified professionals who will provide competitive quotes.
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
                Submit your project details and receive quotes from qualified landscapers in your area.
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
            Join DoneRight Landscaping TX today and transform how you manage landscaping services.
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
              <h3 className="text-xl font-bold gradient-text mb-4">DoneRight Landscaping TX</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Professional landscaping services and business management platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Services</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Lawn Care</li>
                <li>Garden Design</li>
                <li>Tree Services</li>
                <li>Maintenance</li>
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
                  <span>info@donerightlandscapingtx.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Your City, State</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 DoneRight Landscaping TX. All rights reserved. | <span className="gradient-text">Demo data shown for illustration purposes.</span></p>
          </div>
        </div>
      </footer>

      {/* Intake Form Modal */}
      <Dialog open={showIntakeModal} onOpenChange={setShowIntakeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Get Your Free Quote</DialogTitle>
            <DialogDescription className="text-center">
              Fill out the form below and we'll connect you with qualified landscaping professionals
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
    </div>
  );
}
