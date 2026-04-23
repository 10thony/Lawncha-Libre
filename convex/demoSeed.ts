import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/** Marks demo rows for wipe + UI; keep prefix consistent across tables. */
const DEMO = "[DEMO_SEED]";

const OWNER_CLERK_ID = "user_34ChLG52OoHYOE2pm9XCZxxFgfh";

/** Placeholder media for optional URL fields (stable, cacheable). */
const IMG = (label: string) =>
  `https://placehold.co/1200x800/e2e8f0/64748b?text=${encodeURIComponent(`${DEMO} ${label}`)}`;
const SAMPLE_VIDEO =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

const DEMO_CLIENTS = [
  {
    clerkUserId: "demo_client_garcia_residential",
    name: "Maria Garcia",
    phone: "(210) 555-0184",
    address: "118 Cedar Bend Dr, San Antonio, TX",
    businessName: "Garcia Residence (Residential)",
    businessDescription:
      `${DEMO} Single-family homeowner; kitchen and interior remodel scope.`,
    services: ["Kitchen remodel", "Electrical upgrades", "Cabinetry"],
  },
  {
    clerkUserId: "demo_client_nguyen_commercial",
    name: "Duc Nguyen",
    phone: "(210) 555-0122",
    address: "4208 Blanco Rd, San Antonio, TX",
    businessName: "Nguyen Retail Holdings LLC",
    businessDescription: `${DEMO} Small-format retail tenant; turnover and storefront refresh.`,
    services: ["Commercial TI", "Flooring", "Painting"],
  },
  {
    clerkUserId: "demo_client_johnson_remodel",
    name: "Pat Johnson",
    phone: "(210) 555-0177",
    address: "955 Falcon Ridge Ct, Boerne, TX",
    businessName: "Johnson Household",
    businessDescription: `${DEMO} Primary bath refresh; phased schedule around work-from-home.`,
    services: ["Bathroom remodel", "Plumbing", "Tile"],
  },
  {
    clerkUserId: "demo_client_morris_urgent",
    name: "Erica Morris",
    phone: "(210) 555-0145",
    address: "7602 Hidden Creek Ln, Helotes, TX",
    businessName: "Morris Property",
    businessDescription: `${DEMO} Insurance-adjacent moisture remediation; fast-track coordination.`,
    services: ["Water mitigation", "Drywall", "Paint"],
  },
];

function daysFromNow(days: number): number {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

function isDemoClerkId(clerkUserId: string): boolean {
  return clerkUserId.startsWith("demo_");
}

async function wipeDemoDataForOwner(
  ctx: MutationCtx,
  args: {
    ownerClerkUserId: string;
    ownerProfileId: Id<"profiles">;
    primaryBusinessId: Id<"businesses">;
  }
): Promise<{
  deletedTestimonials: number;
  deletedProjects: number;
  deletedIntakeForms: number;
  deletedAppointments: number;
  deletedEmployeeRequests: number;
  deletedEmployeeInvites: number;
  deletedInstagramMedia: number;
  deletedFacebookPosts: number;
  deletedMetaAccounts: number;
  deletedFacebookAppCredentials: number;
  deletedOauthStates: number;
  deletedBusinesses: number;
  deletedProfiles: number;
}> {
  const counts = {
    deletedTestimonials: 0,
    deletedProjects: 0,
    deletedIntakeForms: 0,
    deletedAppointments: 0,
    deletedEmployeeRequests: 0,
    deletedEmployeeInvites: 0,
    deletedInstagramMedia: 0,
    deletedFacebookPosts: 0,
    deletedMetaAccounts: 0,
    deletedFacebookAppCredentials: 0,
    deletedOauthStates: 0,
    deletedBusinesses: 0,
    deletedProfiles: 0,
  };

  const testimonials = await ctx.db
    .query("testimonials")
    .withIndex("by_business", (q) => q.eq("businessOwnerClerkId", args.ownerClerkUserId))
    .collect();
  for (const row of testimonials) {
    if (row.title.includes(DEMO)) {
      await ctx.db.delete(row._id);
      counts.deletedTestimonials += 1;
    }
  }

  const projects = await ctx.db
    .query("projects")
    .withIndex("by_business", (q) => q.eq("businessOwnerClerkId", args.ownerClerkUserId))
    .collect();
  for (const row of projects) {
    if (row.notes?.includes(DEMO)) {
      await ctx.db.delete(row._id);
      counts.deletedProjects += 1;
    }
  }

  const intakes = await ctx.db.query("intakeForms").collect();
  for (const row of intakes) {
    if (row.businessNotes?.includes(DEMO)) {
      await ctx.db.delete(row._id);
      counts.deletedIntakeForms += 1;
    }
  }

  const appointments = await ctx.db
    .query("appointments")
    .withIndex("by_business", (q) => q.eq("businessOwnerClerkId", args.ownerClerkUserId))
    .collect();
  for (const row of appointments) {
    if (row.notes?.includes(DEMO)) {
      await ctx.db.delete(row._id);
      counts.deletedAppointments += 1;
    }
  }

  const empReqs = await ctx.db
    .query("employeeRequests")
    .withIndex("by_company", (q) => q.eq("companyId", args.ownerProfileId))
    .collect();
  for (const row of empReqs) {
    if (row.email.endsWith("@demo-seed.local")) {
      await ctx.db.delete(row._id);
      counts.deletedEmployeeRequests += 1;
    }
  }

  const invites = await ctx.db
    .query("employeeInvites")
    .withIndex("by_company", (q) => q.eq("companyId", args.ownerProfileId))
    .collect();
  for (const row of invites) {
    if (row.token.startsWith("demo_seed_invite_")) {
      await ctx.db.delete(row._id);
      counts.deletedEmployeeInvites += 1;
    }
  }

  const igAll = await ctx.db.query("instagramMedia").collect();
  for (const row of igAll) {
    if (row.userId === args.ownerClerkUserId && row.id.startsWith("demo_ig_")) {
      await ctx.db.delete(row._id);
      counts.deletedInstagramMedia += 1;
    }
  }

  const fbPosts = await ctx.db.query("facebookPosts").collect();
  for (const row of fbPosts) {
    if (row.userId === args.ownerClerkUserId && row.id.startsWith("demo_fb_")) {
      await ctx.db.delete(row._id);
      counts.deletedFacebookPosts += 1;
    }
  }

  const metaAccts = await ctx.db
    .query("metaAccounts")
    .withIndex("by_user", (q) => q.eq("userId", args.ownerClerkUserId))
    .collect();
  for (const row of metaAccts) {
    if (row.longLivedUserToken.startsWith("DEMO_SEED_")) {
      await ctx.db.delete(row._id);
      counts.deletedMetaAccounts += 1;
    }
  }

  const fbCreds = await ctx.db
    .query("facebookAppCredentials")
    .withIndex("by_user", (q) => q.eq("userId", args.ownerClerkUserId))
    .collect();
  for (const row of fbCreds) {
    if (row.encryptedAppId.startsWith("DEMO_SEED_")) {
      await ctx.db.delete(row._id);
      counts.deletedFacebookAppCredentials += 1;
    }
  }

  const oauth = await ctx.db
    .query("oauthStates")
    .withIndex("by_user", (q) => q.eq("userId", args.ownerClerkUserId))
    .collect();
  for (const row of oauth) {
    if (row.state.startsWith("demo_seed_oauth_")) {
      await ctx.db.delete(row._id);
      counts.deletedOauthStates += 1;
    }
  }

  const businesses = await ctx.db
    .query("businesses")
    .withIndex("by_owner_profile", (q) => q.eq("ownerProfileId", args.ownerProfileId))
    .collect();
  for (const row of businesses) {
    if (row._id !== args.primaryBusinessId && row.description?.includes(DEMO)) {
      await ctx.db.delete(row._id);
      counts.deletedBusinesses += 1;
    }
  }

  const allProfiles = await ctx.db.query("profiles").collect();
  for (const row of allProfiles) {
    if (isDemoClerkId(row.clerkUserId)) {
      await ctx.db.delete(row._id);
      counts.deletedProfiles += 1;
    }
  }

  return counts;
}

export const wipeDemoSeedData = mutation({
  args: {
    ownerClerkUserId: v.string(),
    primaryBusinessId: v.id("businesses"),
  },
  returns: v.object({
    deletedTestimonials: v.number(),
    deletedProjects: v.number(),
    deletedIntakeForms: v.number(),
    deletedAppointments: v.number(),
    deletedEmployeeRequests: v.number(),
    deletedEmployeeInvites: v.number(),
    deletedInstagramMedia: v.number(),
    deletedFacebookPosts: v.number(),
    deletedMetaAccounts: v.number(),
    deletedFacebookAppCredentials: v.number(),
    deletedOauthStates: v.number(),
    deletedBusinesses: v.number(),
    deletedProfiles: v.number(),
  }),
  handler: async (ctx, args) => {
    if (args.ownerClerkUserId !== OWNER_CLERK_ID) {
      throw new Error("Wipe is locked to the configured demo owner.");
    }
    const primaryBusiness = await ctx.db.get(args.primaryBusinessId);
    if (!primaryBusiness || primaryBusiness.ownerClerkUserId !== args.ownerClerkUserId) {
      throw new Error("Primary business not found or does not belong to this owner.");
    }
    return await wipeDemoDataForOwner(ctx, {
      ownerClerkUserId: args.ownerClerkUserId,
      ownerProfileId: primaryBusiness.ownerProfileId,
      primaryBusinessId: args.primaryBusinessId,
    });
  },
});

export const seedDemoData = mutation({
  args: {
    ownerClerkUserId: v.string(),
    primaryBusinessId: v.id("businesses"),
    resetExistingDemoData: v.optional(v.boolean()),
  },
  returns: v.object({
    wipe: v.union(
      v.null(),
      v.object({
        deletedTestimonials: v.number(),
        deletedProjects: v.number(),
        deletedIntakeForms: v.number(),
        deletedAppointments: v.number(),
        deletedEmployeeRequests: v.number(),
        deletedEmployeeInvites: v.number(),
        deletedInstagramMedia: v.number(),
        deletedFacebookPosts: v.number(),
        deletedMetaAccounts: v.number(),
        deletedFacebookAppCredentials: v.number(),
        deletedOauthStates: v.number(),
        deletedBusinesses: v.number(),
        deletedProfiles: v.number(),
      })
    ),
    createdClients: v.number(),
    createdAppointments: v.number(),
    createdEmployeeRequests: v.number(),
    createdTestimonials: v.number(),
    createdIntakeForms: v.number(),
    createdProjects: v.number(),
    createdBusinesses: v.number(),
    createdEmployeeInvites: v.number(),
    createdMetaAccounts: v.number(),
    createdFacebookAppCredentials: v.number(),
    createdInstagramMedia: v.number(),
    createdFacebookPosts: v.number(),
    createdOauthStates: v.number(),
  }),
  handler: async (ctx, args) => {
    if (args.ownerClerkUserId !== OWNER_CLERK_ID) {
      throw new Error("Seed is locked to the configured demo owner.");
    }

    const primaryBusiness = await ctx.db.get(args.primaryBusinessId);
    if (!primaryBusiness) {
      throw new Error("Primary business not found.");
    }

    if (primaryBusiness.ownerClerkUserId !== args.ownerClerkUserId) {
      throw new Error("Primary business does not belong to the provided Clerk user.");
    }

    const ownerProfile = await ctx.db.get(primaryBusiness.ownerProfileId);
    if (!ownerProfile || ownerProfile.userType !== "business") {
      throw new Error("Owner profile is missing or not a business profile.");
    }

    if (ownerProfile.clerkUserId !== args.ownerClerkUserId) {
      throw new Error("Owner profile does not match the business owner user.");
    }

    let wipeResult: Awaited<ReturnType<typeof wipeDemoDataForOwner>> | null = null;
    const shouldReset = args.resetExistingDemoData ?? false;
    if (shouldReset) {
      wipeResult = await wipeDemoDataForOwner(ctx, {
        ownerClerkUserId: args.ownerClerkUserId,
        ownerProfileId: ownerProfile._id,
        primaryBusinessId: args.primaryBusinessId,
      });
    }

    let createdClients = 0;
    let createdAppointments = 0;
    let createdEmployeeRequests = 0;
    let createdTestimonials = 0;
    let createdIntakeForms = 0;
    let createdProjects = 0;
    let createdBusinesses = 0;
    let createdEmployeeInvites = 0;
    let createdMetaAccounts = 0;
    let createdFacebookAppCredentials = 0;
    let createdInstagramMedia = 0;
    let createdFacebookPosts = 0;
    let createdOauthStates = 0;

    const demoClientMap = new Map<string, string>();
    const ownerBusinessName =
      primaryBusiness.name.trim() || ownerProfile.businessName || "Demo GC";

    for (const client of DEMO_CLIENTS) {
      const existing = await ctx.db
        .query("profiles")
        .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", client.clerkUserId))
        .unique();

      const payload = {
        clerkUserId: client.clerkUserId,
        name: client.name,
        userType: "client" as const,
        businessName: client.businessName,
        businessDescription: client.businessDescription,
        phone: client.phone,
        address: client.address,
        services: client.services,
      };

      if (!existing) {
        await ctx.db.insert("profiles", payload);
        createdClients += 1;
      } else {
        await ctx.db.patch(existing._id, payload);
      }

      demoClientMap.set(client.name, client.clerkUserId);
    }

    const additionalBusinesses = [
      {
        name: "Libre Renovations - Commercial Division",
        description: `${DEMO} Tenant improvements, storefront refreshes, and office reconfigurations for small commercial properties.`,
        phone: "(210) 555-0201",
        address: "1616 Commerce St, San Antonio, TX",
        services: ["Tenant Improvements", "Storefront Facelifts", "ADA Upgrades"],
        isPrimary: false as boolean,
      },
      {
        name: "Libre Outdoor Living",
        description: `${DEMO} Backyard transformations, covered patios, outdoor kitchens, and pergola packages.`,
        phone: "(210) 555-0202",
        address: "2412 Loop 1604 W, San Antonio, TX",
        services: ["Outdoor Kitchens", "Pergolas", "Covered Patios", "Deck Builds"],
        isPrimary: false as boolean,
      },
    ];

    const existingBusinesses = await ctx.db
      .query("businesses")
      .withIndex("by_owner_profile", (q) => q.eq("ownerProfileId", ownerProfile._id))
      .collect();

    for (const business of additionalBusinesses) {
      const found = existingBusinesses.find((b) => b.name === business.name);
      const now = Date.now();
      if (!found) {
        await ctx.db.insert("businesses", {
          ownerProfileId: ownerProfile._id,
          ownerClerkUserId: args.ownerClerkUserId,
          name: business.name,
          description: business.description,
          phone: business.phone,
          address: business.address,
          services: business.services,
          isPrimary: business.isPrimary,
          createdAt: now,
          updatedAt: now,
        });
        createdBusinesses += 1;
      } else {
        await ctx.db.patch(found._id, {
          description: business.description,
          phone: business.phone,
          address: business.address,
          services: business.services,
          isPrimary: business.isPrimary,
          updatedAt: now,
        });
      }
    }

    const intakeTemplates = [
      {
        firstName: "Maria",
        lastName: "Garcia",
        email: "maria.garcia.demo@example.com",
        phone: "(210) 555-0184",
        projectDescription:
          "Need a full kitchen remodel with open shelving, larger island, and updated lighting. Looking for a mid-tier finish package.",
        status: "claimed" as const,
        estimatedQuote: 48500,
        imageUrls: [IMG("Kitchen intake photo A"), IMG("Kitchen intake photo B")],
        videoUrls: [SAMPLE_VIDEO],
        businessNotes: `${DEMO} Intake seeded for quote workflow walkthrough. Scope locked; awaiting cabinet lead time.`,
        submittedAt: daysFromNow(-14),
        claimedAt: daysFromNow(-13),
        linkedAt: daysFromNow(-12),
        businessOwnerClerkId: args.ownerClerkUserId,
        clientClerkId: demoClientMap.get("Maria Garcia"),
      },
      {
        firstName: "Duc",
        lastName: "Nguyen",
        email: "duc.nguyen.demo@example.com",
        phone: "(210) 555-0122",
        projectDescription:
          "Retail storefront drywall repair, paint refresh, and flooring replacement before reopening in 6 weeks.",
        status: "in_progress" as const,
        estimatedQuote: 32200,
        imageUrls: [IMG("Storefront damage"), IMG("Floor plan sketch")],
        videoUrls: [SAMPLE_VIDEO],
        businessNotes: `${DEMO} Materials ordered; city inspection scheduled.`,
        submittedAt: daysFromNow(-20),
        claimedAt: daysFromNow(-19),
        linkedAt: daysFromNow(-18),
        businessOwnerClerkId: args.ownerClerkUserId,
        clientClerkId: demoClientMap.get("Duc Nguyen"),
      },
      {
        firstName: "Erica",
        lastName: "Morris",
        email: "erica.morris.demo@example.com",
        phone: "(210) 555-0145",
        projectDescription:
          "Water intrusion caused ceiling and wall damage in guest room. Need remediation and quick turnaround.",
        status: "submitted" as const,
        estimatedQuote: 12800,
        imageUrls: [IMG("Moisture stain ceiling"), IMG("Guest room wide")],
        videoUrls: [SAMPLE_VIDEO],
        businessNotes: `${DEMO} New lead — not yet claimed; triage pending.`,
        submittedAt: daysFromNow(-3),
        claimedAt: undefined,
        linkedAt: undefined,
        businessOwnerClerkId: undefined,
        clientClerkId: demoClientMap.get("Erica Morris"),
      },
    ];

    const allIntakes = await ctx.db.query("intakeForms").collect();

    for (const intake of intakeTemplates) {
      const exists = allIntakes.some(
        (form) =>
          form.email === intake.email && form.businessNotes?.includes(DEMO)
      );
      if (exists) continue;

      await ctx.db.insert("intakeForms", {
        firstName: intake.firstName,
        lastName: intake.lastName,
        email: intake.email,
        phone: intake.phone,
        projectDescription: intake.projectDescription,
        imageUrls: intake.imageUrls,
        videoUrls: intake.videoUrls,
        status: intake.status,
        submittedAt: intake.submittedAt,
        claimedAt: intake.claimedAt,
        linkedAt: intake.linkedAt,
        businessOwnerClerkId: intake.businessOwnerClerkId,
        clientClerkId: intake.clientClerkId,
        businessNotes: intake.businessNotes,
        estimatedQuote: intake.estimatedQuote,
      });
      createdIntakeForms += 1;
    }

    const demoEmployees = [
      {
        clerkUserId: "demo_employee_lead_carpenter",
        name: "Luis Ortega",
        phone: "(210) 555-0311",
        status: "approved" as const,
      },
      {
        clerkUserId: "demo_employee_field_tech",
        name: "Alyssa Reed",
        phone: "(210) 555-0312",
        status: "pending" as const,
      },
      {
        clerkUserId: "demo_employee_helper",
        name: "Marcus Bell",
        phone: "(210) 555-0313",
        status: "rejected" as const,
      },
    ];

    const leadCarpenterId = "demo_employee_lead_carpenter";
    const fieldTechId = "demo_employee_field_tech";

    for (const employee of demoEmployees) {
      const existingProfile = await ctx.db
        .query("profiles")
        .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", employee.clerkUserId))
        .unique();

      const empPayload = {
        clerkUserId: employee.clerkUserId,
        name: employee.name,
        userType: "employee" as const,
        businessName: ownerBusinessName,
        businessDescription: `${DEMO} Field staff profile for ${ownerBusinessName}.`,
        phone: employee.phone,
        address: "210 Industrial Pkwy, San Antonio, TX",
        services: ["Rough carpentry", "Site safety", "Tooling"],
        companyId: ownerProfile._id,
        employeeStatus: employee.status,
      };

      if (!existingProfile) {
        await ctx.db.insert("profiles", empPayload);
      } else {
        await ctx.db.patch(existingProfile._id, empPayload);
      }

      const existingRequest = await ctx.db
        .query("employeeRequests")
        .withIndex("by_employee", (q) => q.eq("employeeClerkId", employee.clerkUserId))
        .filter((q) => q.eq(q.field("companyId"), ownerProfile._id))
        .first();

      const reqPayload = {
        employeeClerkId: employee.clerkUserId,
        companyId: ownerProfile._id,
        firstName: employee.name.split(" ")[0] ?? employee.name,
        lastName: employee.name.split(" ").slice(1).join(" ") || "Demo",
        email: `${employee.clerkUserId}@demo-seed.local`,
        phone: employee.phone,
        status: employee.status,
        requestedAt: daysFromNow(-20),
        reviewedAt: employee.status === "pending" ? undefined : daysFromNow(-19),
        reviewedBy: employee.status === "pending" ? undefined : args.ownerClerkUserId,
        rejectionReason:
          employee.status === "rejected"
            ? `${DEMO} Missing required OSHA certs for this role.`
            : employee.status === "pending"
              ? undefined
              : `${DEMO} N/A — request approved.`,
      };

      if (!existingRequest) {
        await ctx.db.insert("employeeRequests", reqPayload);
        createdEmployeeRequests += 1;
      } else {
        await ctx.db.patch(existingRequest._id, reqPayload);
      }
    }

    const projectTemplates: Array<{
      clientName: string;
      projectType: string;
      projectName: string;
      projectTasks: Array<{
        name: string;
        status: "queued" | "in_progress" | "done";
      }>;
      imageUrls: string[];
      estimatedLength: number;
      estimatedStartDateTime: number;
      estimatedEndDateTime: number;
      actualStartDateTime?: number;
      actualEndDateTime?: number;
      status: "planned" | "in_progress" | "completed" | "cancelled";
      approvalStatus: "pending" | "approved" | "rejected";
      rejectionReason?: string;
      notes: string;
      assignedEmployees?: string[];
      isFromFacebookPost: boolean;
      facebookPostId?: string;
      facebookPostUrl?: string;
      isPublicShowcase: boolean;
      projectDescription: string;
    }> = [
      {
        clientName: "Maria Garcia",
        projectType: "Kitchen Remodel",
        projectName: "Garcia Kitchen Modernization",
        projectTasks: [
          { name: "Finalize cabinet elevations", status: "done" },
          { name: "Complete demolition and haul-off", status: "done" },
          { name: "Install electrical rough-in", status: "in_progress" },
          { name: "Template countertops", status: "queued" },
        ],
        imageUrls: [IMG("Kitchen progress 1"), IMG("Kitchen progress 2")],
        estimatedLength: 42,
        estimatedStartDateTime: daysFromNow(-10),
        estimatedEndDateTime: daysFromNow(32),
        actualStartDateTime: daysFromNow(-8),
        status: "in_progress",
        approvalStatus: "approved",
        notes: `${DEMO} Active project with completed + in-progress tasks for production tracking demo.`,
        assignedEmployees: [leadCarpenterId],
        isFromFacebookPost: false,
        facebookPostId: undefined,
        facebookPostUrl: undefined,
        isPublicShowcase: false,
        projectDescription: `${DEMO} Full kitchen gut, mid-tier finishes, island expansion, lighting package.`,
      },
      {
        clientName: "Duc Nguyen",
        projectType: "Commercial Renovation",
        projectName: "Nguyen Retail Turnover Buildout",
        projectTasks: [
          { name: "Field measurements and permit package", status: "done" },
          { name: "Framing and drywall repairs", status: "done" },
          { name: "Prime and paint", status: "done" },
          { name: "LVT flooring install", status: "done" },
        ],
        imageUrls: [IMG("Retail after 1"), IMG("Retail after 2")],
        estimatedLength: 30,
        estimatedStartDateTime: daysFromNow(-48),
        estimatedEndDateTime: daysFromNow(-18),
        actualStartDateTime: daysFromNow(-47),
        actualEndDateTime: daysFromNow(-17),
        status: "completed",
        approvalStatus: "approved",
        rejectionReason: undefined,
        notes: `${DEMO} Completed project for before/after showcase and review request workflow.`,
        assignedEmployees: [leadCarpenterId, fieldTechId],
        isFromFacebookPost: true,
        facebookPostId: "demo_fb_post_portfolio_001",
        facebookPostUrl: "https://www.facebook.com/demo/posts/demo_fb_post_portfolio_001",
        isPublicShowcase: true,
        projectDescription: `${DEMO} Turnkey retail refresh: drywall, paint, LVT, storefront coordination.`,
      },
      {
        clientName: "Pat Johnson",
        projectType: "Bathroom Remodel",
        projectName: "Johnson Primary Bath Refresh",
        projectTasks: [
          { name: "Prepare quote package", status: "queued" },
          { name: "Client budget confirmation", status: "queued" },
          { name: "Schedule kickoff", status: "queued" },
        ],
        imageUrls: [IMG("Bath inspiration"), IMG("Fixture schedule")],
        estimatedLength: 21,
        estimatedStartDateTime: daysFromNow(12),
        estimatedEndDateTime: daysFromNow(33),
        status: "planned",
        approvalStatus: "pending",
        rejectionReason: undefined,
        notes: `${DEMO} Pending-approval quote converted to project for client accept/reject walkthrough.`,
        assignedEmployees: [],
        isFromFacebookPost: false,
        facebookPostId: undefined,
        facebookPostUrl: undefined,
        isPublicShowcase: false,
        projectDescription: `${DEMO} Primary bath gut, curbless shower, vanity wall, vent upgrade.`,
      },
      {
        clientName: "Erica Morris",
        projectType: "Emergency Restoration",
        projectName: "Morris Moisture Damage Restoration",
        projectTasks: [
          { name: "Mitigation setup", status: "done" },
          { name: "Demo damaged drywall", status: "in_progress" },
          { name: "Install replacement insulation", status: "queued" },
        ],
        imageUrls: [IMG("Mitigation fans"), IMG("Damaged cavity")],
        estimatedLength: 14,
        estimatedStartDateTime: daysFromNow(-2),
        estimatedEndDateTime: daysFromNow(12),
        actualStartDateTime: daysFromNow(-1),
        status: "in_progress",
        approvalStatus: "approved",
        rejectionReason: undefined,
        notes: `${DEMO} Fast-turn emergency job to demonstrate priority scheduling and status visibility.`,
        assignedEmployees: [fieldTechId],
        isFromFacebookPost: false,
        facebookPostId: undefined,
        facebookPostUrl: undefined,
        isPublicShowcase: false,
        projectDescription: `${DEMO} Moisture intrusion remediation; drywall, insulation, paint touch-up.`,
      },
    ];

    const existingProjects = await ctx.db
      .query("projects")
      .withIndex("by_business", (q) => q.eq("businessOwnerClerkId", args.ownerClerkUserId))
      .collect();

    for (const project of projectTemplates) {
      const duplicate = existingProjects.find((p) => p.projectName === project.projectName);
      const clientClerkId = demoClientMap.get(project.clientName);
      if (!clientClerkId) continue;

      const doc = {
        businessOwnerClerkId: args.ownerClerkUserId,
        clientClerkId,
        projectType: project.projectType,
        projectName: project.projectName,
        projectTasks: project.projectTasks,
        imageUrls: project.imageUrls,
        estimatedLength: project.estimatedLength,
        estimatedStartDateTime: project.estimatedStartDateTime,
        estimatedEndDateTime: project.estimatedEndDateTime,
        actualStartDateTime: project.actualStartDateTime,
        actualEndDateTime: project.actualEndDateTime,
        status: project.status,
        approvalStatus: project.approvalStatus,
        rejectionReason: project.rejectionReason,
        notes: project.notes,
        assignedEmployees:
          project.assignedEmployees && project.assignedEmployees.length > 0
            ? project.assignedEmployees
            : undefined,
        isFromFacebookPost: project.isFromFacebookPost,
        facebookPostId: project.facebookPostId,
        facebookPostUrl: project.facebookPostUrl,
        isPublicShowcase: project.isPublicShowcase,
        projectDescription: project.projectDescription,
      };

      if (!duplicate) {
        await ctx.db.insert("projects", doc);
        createdProjects += 1;
      } else {
        await ctx.db.patch(duplicate._id, doc);
      }
    }

    const appointmentTemplates = [
      {
        clientName: "Pat Johnson",
        startDateTime: daysFromNow(2),
        endDateTime: daysFromNow(2) + 60 * 60 * 1000,
        status: "available" as const,
        notes: `${DEMO} Open estimate slot for prospect booking walkthrough.`,
      },
      {
        clientName: "Maria Garcia",
        startDateTime: daysFromNow(4),
        endDateTime: daysFromNow(4) + 90 * 60 * 1000,
        status: "booked" as const,
        notes: `${DEMO} Booked site walk for active remodel client.`,
      },
      {
        clientName: "Duc Nguyen",
        startDateTime: daysFromNow(-6),
        endDateTime: daysFromNow(-6) + 90 * 60 * 1000,
        status: "completed" as const,
        notes: `${DEMO} Completed punch-list walkthrough for closeout flow.`,
      },
      {
        clientName: "Erica Morris",
        startDateTime: daysFromNow(-1),
        endDateTime: daysFromNow(-1) + 60 * 60 * 1000,
        status: "cancelled" as const,
        notes: `${DEMO} Cancelled emergency visit to demonstrate rescheduling.`,
      },
    ];

    const existingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_business", (q) => q.eq("businessOwnerClerkId", args.ownerClerkUserId))
      .collect();

    for (const appointment of appointmentTemplates) {
      const duplicate = existingAppointments.find(
        (a) => a.notes === appointment.notes
      );
      const clientClerkId = demoClientMap.get(appointment.clientName);
      const shouldAttachClient =
        appointment.status !== "available" && Boolean(clientClerkId);

      const doc = {
        businessOwnerClerkId: args.ownerClerkUserId,
        clientClerkId: shouldAttachClient ? clientClerkId : undefined,
        startDateTime: appointment.startDateTime,
        endDateTime: appointment.endDateTime,
        status: appointment.status,
        notes: appointment.notes,
      };

      if (!duplicate) {
        await ctx.db.insert("appointments", doc);
        createdAppointments += 1;
      } else {
        await ctx.db.patch(duplicate._id, doc);
      }
    }

    const latestProjects = await ctx.db
      .query("projects")
      .withIndex("by_business", (q) => q.eq("businessOwnerClerkId", args.ownerClerkUserId))
      .collect();
    const completedProject = latestProjects.find(
      (p) => p.projectName === "Nguyen Retail Turnover Buildout"
    );

    const testimonialTemplates = [
      {
        clientName: "Duc Nguyen",
        title: `${DEMO} Fast commercial turnover`,
        description:
          "The team helped us reopen ahead of schedule and coordinated inspections without slowing us down.",
        rating: 5,
        isHighlighted: true,
        projectId: completedProject?._id,
        imageUrls: [IMG("Review photo storefront")],
      },
      {
        clientName: "Maria Garcia",
        title: `${DEMO} Strong communication and clean worksite`,
        description:
          "Weekly updates were clear, the crew was respectful, and change orders were transparent.",
        rating: 5,
        isHighlighted: false,
        projectId: undefined,
        imageUrls: [IMG("Review photo kitchen")],
      },
    ];

    const existingTestimonials = await ctx.db
      .query("testimonials")
      .withIndex("by_business", (q) => q.eq("businessOwnerClerkId", args.ownerClerkUserId))
      .collect();

    for (const testimonial of testimonialTemplates) {
      const duplicate = existingTestimonials.find((t) => t.title === testimonial.title);
      const clientClerkId = demoClientMap.get(testimonial.clientName);
      if (!clientClerkId) continue;

      const doc = {
        clientClerkId,
        businessOwnerClerkId: args.ownerClerkUserId,
        projectId: testimonial.projectId,
        title: testimonial.title,
        description: testimonial.description,
        rating: testimonial.rating,
        imageUrls: testimonial.imageUrls,
        isHighlighted: testimonial.isHighlighted,
      };

      if (!duplicate) {
        await ctx.db.insert("testimonials", doc);
        createdTestimonials += 1;
      } else {
        await ctx.db.patch(duplicate._id, doc);
      }
    }

    const now = Date.now();
    const inviteToken = "demo_seed_invite_primary";
    const existingInvite = await ctx.db
      .query("employeeInvites")
      .withIndex("by_token", (q) => q.eq("token", inviteToken))
      .unique();
    if (!existingInvite) {
      await ctx.db.insert("employeeInvites", {
        token: inviteToken,
        companyId: ownerProfile._id,
        createdByClerkId: args.ownerClerkUserId,
        createdAt: now,
        expiresAt: now + 30 * 24 * 60 * 60 * 1000,
      });
      createdEmployeeInvites += 1;
    }

    const pageId = "demo_seed_page_001";
    const existingMeta = await ctx.db
      .query("metaAccounts")
      .withIndex("by_user", (q) => q.eq("userId", args.ownerClerkUserId))
      .collect();
    const metaRow = existingMeta.find((m) => m.longLivedUserToken.startsWith("DEMO_SEED_"));
    const metaPayload = {
      userId: args.ownerClerkUserId,
      longLivedUserToken: "DEMO_SEED_long_lived_user_token_placeholder_not_real",
      tokenExpiresAt: now + 90 * 24 * 60 * 60 * 1000,
      facebookUserId: "demo_seed_fb_user_001",
      connectedPages: [
        {
          pageId,
          name: `${DEMO} Demo Contractor Page`,
          pageAccessToken: "DEMO_SEED_page_access_token_placeholder",
        },
      ],
      instagramBusinessAccountId: "demo_seed_ig_business_001",
      createdAt: now,
      updatedAt: now,
    };
    if (!metaRow) {
      await ctx.db.insert("metaAccounts", metaPayload);
      createdMetaAccounts += 1;
    } else {
      await ctx.db.patch(metaRow._id, metaPayload);
    }

    const credExisting = await ctx.db
      .query("facebookAppCredentials")
      .withIndex("by_user", (q) => q.eq("userId", args.ownerClerkUserId))
      .collect();
    const credRow = credExisting.find((c) => c.encryptedAppId.startsWith("DEMO_SEED_"));
    const credPayload = {
      userId: args.ownerClerkUserId,
      encryptedAppId: "DEMO_SEED_encrypted_app_id_placeholder",
      encryptedAppSecret: "DEMO_SEED_encrypted_app_secret_placeholder",
      encryptedRedirectUri: "DEMO_SEED_encrypted_redirect_uri_placeholder",
      appName: `${DEMO} Meta App (demo credentials)`,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    if (!credRow) {
      await ctx.db.insert("facebookAppCredentials", credPayload);
      createdFacebookAppCredentials += 1;
    } else {
      await ctx.db.patch(credRow._id, credPayload);
    }

    const igId = "demo_ig_media_showcase_001";
    const existingIg = await ctx.db
      .query("instagramMedia")
      .withIndex("by_media_id", (q) => q.eq("id", igId))
      .unique();
    const igPayload = {
      id: igId,
      userId: args.ownerClerkUserId,
      pageId,
      caption: `${DEMO} Finished kitchen — demo portfolio post synced from Instagram.`,
      mediaType: "CAROUSEL_ALBUM",
      mediaUrl: IMG("IG cover"),
      permalink: "https://www.instagram.com/p/demo_seed_showcase_001/",
      timestamp: daysFromNow(-30),
      children: [
        { mediaType: "IMAGE", mediaUrl: IMG("IG slide 1") },
        { mediaType: "IMAGE", mediaUrl: IMG("IG slide 2") },
      ],
      createdAt: now,
      fetchedAt: now,
    };
    if (!existingIg) {
      await ctx.db.insert("instagramMedia", igPayload);
      createdInstagramMedia += 1;
    } else {
      await ctx.db.patch(existingIg._id, igPayload);
    }

    const fbPostId = "demo_fb_post_timeline_001";
    const existingFbPost = await ctx.db
      .query("facebookPosts")
      .withIndex("by_post_id", (q) => q.eq("id", fbPostId))
      .unique();
    const fbPostPayload = {
      id: fbPostId,
      userId: args.ownerClerkUserId,
      pageId,
      message: `${DEMO} Book spring estimates — slots opening next week.`,
      permalinkUrl: "https://www.facebook.com/demo/posts/demo_fb_post_timeline_001",
      createdTime: daysFromNow(-5),
      attachments: [{ mediaType: "photo", mediaUrl: IMG("FB attachment") }],
      createdAt: now,
      fetchedAt: now,
    };
    if (!existingFbPost) {
      await ctx.db.insert("facebookPosts", fbPostPayload);
      createdFacebookPosts += 1;
    } else {
      await ctx.db.patch(existingFbPost._id, fbPostPayload);
    }

    const oauthState = "demo_seed_oauth_state_expired_001";
    const existingOauth = await ctx.db
      .query("oauthStates")
      .withIndex("by_state", (q) => q.eq("state", oauthState))
      .unique();
    const oauthPayload = {
      state: oauthState,
      userId: args.ownerClerkUserId,
      createdAt: daysFromNow(-2),
      expiresAt: daysFromNow(-1),
    };
    if (!existingOauth) {
      await ctx.db.insert("oauthStates", oauthPayload);
      createdOauthStates += 1;
    } else {
      await ctx.db.patch(existingOauth._id, oauthPayload);
    }

    return {
      wipe: wipeResult,
      createdClients,
      createdAppointments,
      createdEmployeeRequests,
      createdTestimonials,
      createdIntakeForms,
      createdProjects,
      createdBusinesses,
      createdEmployeeInvites,
      createdMetaAccounts,
      createdFacebookAppCredentials,
      createdInstagramMedia,
      createdFacebookPosts,
      createdOauthStates,
    };
  },
});
