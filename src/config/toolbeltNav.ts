import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  FolderOpen,
  Star,
  User,
  Quote,
  FileVideo,
  Link,
  Instagram,
  Facebook,
  Users,
  BriefcaseBusiness,
  Settings,
} from "lucide-react";

/** Tab ids used across Dashboard content panels */
export type TabId =
  | "overview"
  | "appointments"
  | "projects"
  | "testimonials"
  | "quotes"
  | "employees"
  | "businesses"
  | "intake"
  | "facebook-integration"
  | "social-feed"
  | "social-settings"
  | "social-management"
  | "video-demo";

export type ProfileUserType = "business" | "client" | "employee";

export type NavSectionId = "main" | "business" | "requests" | "social" | "tools";

export type NavItemDef = {
  id: TabId;
  label: string;
  helper: string;
  icon: LucideIcon;
  roles: Array<"business" | "client">;
  section: NavSectionId;
};

/**
 * Single source of truth for labels, icons, and role visibility.
 * Reorder `NAV_ITEMS` to change sidebar order.
 */
export const NAV_ITEMS: NavItemDef[] = [
  {
    id: "overview",
    label: "Overview",
    helper: "Profile and quick stats",
    icon: User,
    roles: ["business", "client"],
    section: "main",
  },
  {
    id: "appointments",
    label: "Appointments",
    helper: "Book and manage appointments",
    icon: Calendar,
    roles: ["business", "client"],
    section: "main",
  },
  {
    id: "projects",
    label: "Projects",
    helper: "Track jobs and progress",
    icon: FolderOpen,
    roles: ["business", "client"],
    section: "main",
  },
  {
    id: "testimonials",
    label: "Reviews",
    helper: "Customer reviews and ratings",
    icon: Star,
    roles: ["business", "client"],
    section: "main",
  },
  {
    id: "quotes",
    label: "Quote Requests",
    helper: "Incoming quote requests",
    icon: Quote,
    roles: ["business"],
    section: "business",
  },
  {
    id: "employees",
    label: "Employees",
    helper: "Team and roles",
    icon: Users,
    roles: ["business"],
    section: "business",
  },
  {
    id: "businesses",
    label: "Businesses",
    helper: "Business profiles you manage",
    icon: BriefcaseBusiness,
    roles: ["business"],
    section: "business",
  },
  {
    id: "intake",
    label: "My Requests",
    helper: "Your submitted requests",
    icon: Quote,
    roles: ["client"],
    section: "requests",
  },
  {
    id: "social-feed",
    label: "Social Feed",
    helper: "Feed and porting",
    icon: Instagram,
    roles: ["business", "client"],
    section: "social",
  },
  {
    id: "social-settings",
    label: "Social Settings",
    helper: "Connections and accounts",
    icon: Link,
    roles: ["business", "client"],
    section: "social",
  },
  {
    id: "social-management",
    label: "Social Management",
    helper: "Posts and scheduling",
    icon: Settings,
    roles: ["business", "client"],
    section: "social",
  },
  {
    id: "facebook-integration",
    label: "Facebook Integration",
    helper: "Facebook tools",
    icon: Facebook,
    roles: ["business", "client"],
    section: "social",
  },
  {
    id: "video-demo",
    label: "Video Upload Demo",
    helper: "Upload demo",
    icon: FileVideo,
    roles: ["business", "client"],
    section: "tools",
  },
];

export function getNavItemsForRole(
  userType: ProfileUserType
): NavItemDef[] {
  if (userType === "employee") return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(userType));
}

export function getTabLabel(tabId: TabId): string {
  return NAV_ITEMS.find((n) => n.id === tabId)?.label ?? "Dashboard";
}

export function getTabHelper(tabId: TabId): string | undefined {
  return NAV_ITEMS.find((n) => n.id === tabId)?.helper;
}

export type SidebarSection = {
  sectionId: NavSectionId;
  title: string | undefined;
  items: NavItemDef[];
};

export function getSidebarSections(
  userType: "business" | "client",
  isCollapsed: boolean
): SidebarSection[] {
  const items = getNavItemsForRole(userType);
  const sectionMeta: Record<
    NavSectionId,
    { title: string | undefined }
  > = {
    main: { title: isCollapsed ? undefined : "Main" },
    business: { title: isCollapsed ? undefined : "Business" },
    requests: { title: isCollapsed ? undefined : "Requests" },
    social: { title: isCollapsed ? undefined : "Social Media" },
    tools: { title: isCollapsed ? undefined : "Tools" },
  };

  const order: NavSectionId[] = [
    "main",
    "business",
    "requests",
    "social",
    "tools",
  ];

  return order
    .map((sectionId) => {
      const sectionItems = items.filter((i) => i.section === sectionId);
      if (sectionItems.length === 0) return null;
      return {
        sectionId,
        title: sectionMeta[sectionId].title,
        items: sectionItems,
      };
    })
    .filter(Boolean) as SidebarSection[];
}
