import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { BrowserRouter } from "react-router-dom";
import "@uploadthing/react/styles.css";
import "./index.css";
import App from "./App";

const convexUrl =
  import.meta.env.VITE_CONVEX_URL || import.meta.env.CONVEX_URL;
if (!convexUrl) {
  throw new Error(
    "Missing Convex deployment URL. Set VITE_CONVEX_URL or CONVEX_URL to your Convex https://….convex.cloud URL. It must be available when `vite build` runs (e.g. add it to Cloudflare build environment variables, then redeploy). See https://docs.convex.dev/production/hosting/"
  );
}
const convex = new ConvexReactClient(convexUrl);
const clerkLocalization = {
  signIn: {
    start: {
      title: "Sign in to Atheca",
      subtitle: "Access your account to continue.",
    },
  },
  signUp: {
    start: {
      title: "Create your Atheca account",
      subtitle: "Set up your profile and start managing work.",
    },
  },
} as const;

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string}
    localization={clerkLocalization}
  >
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexProviderWithClerk>
  </ClerkProvider>,
);
