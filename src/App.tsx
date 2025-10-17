import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ProfileSetup } from "./components/ProfileSetup";
import { Dashboard } from "./components/Dashboard";
import { Homepage } from "./components/Homepage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-green-600">DoneRight Landscaping TX</h2>
        <SignedIn>
          <SignOutButton />
        </SignedIn>
      </header>
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
        ) : (
          <Dashboard profile={profile} />
        )}
      </SignedIn>
    </>
  );
}
