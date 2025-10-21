import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ProfileSetup } from "./components/ProfileSetup";
import { Dashboard } from "./components/Dashboard";
import { Homepage } from "./components/Homepage";
import { Badge } from "./components/ui/badge";
import { ThemeToggle } from "./components/ui/theme-toggle";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <main className="flex-1">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const { isLoaded, isSignedIn } = useUser();
  const profile = useQuery(api.profiles.getCurrentProfile);

  if (!isLoaded || (isSignedIn && profile === undefined)) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <Homepage />
      </SignedOut>
      
      <SignedIn>
        {!profile ? (
          <ProfileSetup />
        ) : profile.userType === "employee" && profile.employeeStatus !== "approved" ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="text-6xl animate-bounce-subtle">⏳</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Request Pending</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Your employee request is currently being reviewed by the company owner. 
                You will be notified once your request has been approved.
              </p>
              <div className="mt-4">
                <Badge variant="secondary">
                  Status: {profile.employeeStatus || "pending"}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <Dashboard profile={profile} />
        )}
      </SignedIn>
    </>
  );
}
