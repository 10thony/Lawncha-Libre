import { useState } from "react";
import { SignInForm } from "../SignInForm";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
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
  const [showSignIn, setShowSignIn] = useState(false);

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
      description: "Lawncha Libre completely transformed our backyard into a beautiful oasis. The team was professional, punctual, and exceeded our expectations.",
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

  if (showSignIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-600 mb-2">Welcome to Lawncha Libre</h1>
            <p className="text-gray-600">Sign in to manage your landscaping business or book services</p>
          </div>
          <Card>
            <CardContent className="p-6">
              <SignInForm />
              <div className="mt-4 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowSignIn(false)}
                  className="text-sm text-gray-500"
                >
                  ← Back to homepage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Demo Mode Banner */}
      <div className="bg-blue-600 text-white py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <Info className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm md:text-base font-medium">
            Demo Mode: All data shown on this page is mocked for demonstration purposes
          </p>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Professional Landscaping
            <span className="text-green-600 block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with trusted landscaping professionals or manage your landscaping business with our comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowSignIn(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockServices.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <service.icon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          
          {/* Appointment Booking Demo */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <Calendar className="h-6 w-6 text-green-600 mr-2" />
                Smart Appointment Booking
              </h3>
              <p className="text-gray-600 mb-6">
                Clients can easily view available time slots and book appointments with landscaping professionals. 
                Business owners can manage their calendar and availability in real-time.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Available Appointments:</p>
                {mockAppointments.map((apt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{apt.date}</span>
                      <span className="text-gray-600">{apt.time}</span>
                      <Badge variant="outline">{apt.type}</Badge>
                    </div>
                    <Badge variant={apt.status === 'available' ? 'default' : 'secondary'}>
                      {apt.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="font-semibold mb-4">Book an Appointment</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Service Type</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Consultation</option>
                    <option>Site Visit</option>
                    <option>Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Date</label>
                  <input type="date" className="w-full p-2 border rounded-md" />
                </div>
                <Button className="w-full" disabled>
                  Book Appointment (Demo)
                </Button>
              </div>
            </div>
          </div>

          {/* Project Management Demo */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="font-semibold mb-4">Active Projects</h4>
              <div className="space-y-3">
                {mockProjects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{project.name}</h5>
                      <Badge variant={
                        project.status === 'completed' ? 'default' : 
                        project.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Type: {project.type}</p>
                    <p className="text-sm text-gray-600 mb-1">Duration: {project.duration}</p>
                    <p className="text-sm text-gray-600">Client: {project.client}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                Project Management
              </h3>
              <p className="text-gray-600 mb-6">
                Business owners can create, track, and manage landscaping projects from initial consultation 
                to completion. Keep clients informed with real-time updates and progress tracking.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Create detailed project plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Track project progress and milestones</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Manage timelines and deadlines</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Client communication and updates</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Testimonials Demo */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <Star className="h-6 w-6 text-green-600 mr-2" />
                Customer Reviews & Testimonials
              </h3>
              <p className="text-gray-600 mb-6">
                Build trust with potential clients through authentic customer reviews. 
                Business owners can highlight their best testimonials to showcase their expertise.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">5-star rating system</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Detailed written reviews</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Highlight featured testimonials</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Project-specific feedback</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              {mockTestimonials.map((testimonial) => (
                <Card key={testimonial.id} className={`${testimonial.highlighted ? 'ring-2 ring-yellow-400' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {testimonial.highlighted && (
                          <Badge variant="secondary" className="text-xs">Featured</Badge>
                        )}
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{testimonial.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{testimonial.description}</p>
                    <p className="text-xs text-gray-500">- {testimonial.client}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join Lawncha Libre today and transform how you manage landscaping services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setShowSignIn(true)}
              className="px-8 py-3"
            >
              Sign Up as Business Owner
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setShowSignIn(true)}
              className="px-8 py-3 bg-transparent text-white border-2 border-white hover:bg-white hover:text-green-600"
            >
              Sign Up as Client
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-4">Lawncha Libre</h3>
              <p className="text-gray-400 text-sm">
                Professional landscaping services and business management platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Lawn Care</li>
                <li>Garden Design</li>
                <li>Tree Services</li>
                <li>Maintenance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Appointment Booking</li>
                <li>Project Management</li>
                <li>Customer Reviews</li>
                <li>Business Dashboard</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>info@lawnchalibr.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Your City, State</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Lawncha Libre. All rights reserved. | Demo data shown for illustration purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
