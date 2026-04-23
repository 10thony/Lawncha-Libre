import { useEffect, useState } from "react";
import { Show, useUser } from "@clerk/react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ProfileSetup } from "./components/ProfileSetup";
import { Dashboard } from "./components/Dashboard";
import { Homepage } from "./components/Homepage";
import { Badge } from "./components/ui/badge";
import { AthecaIntroAnimation } from "./components/AthecaIntroAnimation";
import { ProjectsWarRoom } from "./components/style-poc-warroom";
import { ProjectsDossier } from "./components/style-poc-dossier";
import { ProjectsBrutalist } from "./components/style-poc-brutalist";
import { ProjectsTransit } from "./components/style-poc-transit";
import { ProjectsCartography } from "./components/style-poc-cartography";
import {
  clearStoredEmployeeInviteToken,
  readStoredEmployeeInviteToken,
  storeEmployeeInviteToken,
} from "./employeeInvite";

function getInitialEmployeeInviteToken(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("invite");
  if (fromUrl) {
    storeEmployeeInviteToken(fromUrl);
    window.history.replaceState({}, "", window.location.pathname);
    return fromUrl;
  }
  return readStoredEmployeeInviteToken();
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] transition-colors duration-300">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Content />} />
          <Route path="/1" element={<ProjectsWarRoom />} />
          <Route path="/2" element={<ProjectsDossier />} />
          <Route path="/5" element={<ProjectsCartography />} />
          <Route path="/9" element={<ProjectsBrutalist />} />
          <Route path="/10" element={<ProjectsTransit />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const { isLoaded, isSignedIn } = useUser();
  const profile = useQuery(api.profiles.getCurrentProfile);
  const [showLandingIntro, setShowLandingIntro] = useState(true);
  const [employeeInviteToken, setEmployeeInviteToken] = useState<string | null>(
    getInitialEmployeeInviteToken
  );

  const employeeInviteInfo = useQuery(
    api.profiles.getEmployeeInviteByToken,
    employeeInviteToken ? { token: employeeInviteToken } : "skip"
  );

  useEffect(() => {
    if (profile) {
      clearStoredEmployeeInviteToken();
      setEmployeeInviteToken(null);
    }
  }, [profile]);

  useEffect(() => {
    if (employeeInviteToken && employeeInviteInfo === null) {
      clearStoredEmployeeInviteToken();
      setEmployeeInviteToken(null);
    }
  }, [employeeInviteToken, employeeInviteInfo]);

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

  if (!isSignedIn && showLandingIntro) {
    return <AthecaIntroAnimation onComplete={() => setShowLandingIntro(false)} />;
  }

  return (
    <>
      <Show when="signed-out">
        <Homepage />
      </Show>
      <Show when="signed-in">
        {!profile ? (
          <ProfileSetup
            employeeInviteToken={employeeInviteToken}
            employeeInviteInfo={employeeInviteInfo}
          />
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
      </Show>
    </>
  );
}
