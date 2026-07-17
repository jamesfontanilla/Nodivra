/**
 * Seed script for local development.
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage: npx tsx scripts/seed.ts
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = "dev@nodivra.test";
const PASSWORD = "password123";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type SectionRow = Database["public"]["Tables"]["page_sections"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

const DEFAULT_LINKS = [
  {
    title: "GitHub",
    url: "https://github.com/janedev",
    icon_label: "GH",
  },
  {
    title: "Blog",
    url: "https://blog.example.com",
    icon_label: "BL",
  },
  {
    title: "LinkedIn",
    url: "https://linkedin.com/in/janedev",
    icon_label: "IN",
  },
  {
    title: "Latest project",
    url: "https://example.com/project",
    icon_label: "PR",
  },
];

const DEFAULT_SETTINGS = {
  show_location: true,
  show_timezone: true,
  show_availability: true,
  theme: "default",
};

const DEFAULT_SECTIONS = [
  { title: "About", slug: "about", position: 0, is_visible: true, is_collapsed_in_editor: false },
  { title: "Work", slug: "work", position: 1, is_visible: true, is_collapsed_in_editor: false },
  { title: "Writing", slug: "writing", position: 2, is_visible: true, is_collapsed_in_editor: false },
  { title: "Contact", slug: "contact", position: 3, is_visible: true, is_collapsed_in_editor: false },
  { title: "Elsewhere", slug: "elsewhere", position: 4, is_visible: true, is_collapsed_in_editor: true },
];

const DEFAULT_PROJECTS = [
  {
    slug: "nodivra-studio",
    title: "Nodivra Studio",
    summary: "A premium identity builder for developers who want one clean public surface.",
    caseStudyMd: `## The problem

Developers needed a fast way to present who they are, what they build, and why their work matters.

## The approach

- Keep the public profile mobile-first.
- Let projects stand on their own with curated case studies.
- Make publication feel deliberate instead of accidental.

> Clarity beats volume every time.

## Outcome

The result is a profile system that feels human, polished, and easy to keep up to date.`,
    role: "Product design and full-stack engineering",
    projectType: "web_app",
    status: "shipped",
    startDate: "2026-05-01",
    endDate: "2026-07-01",
    coverImageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt: "Developer workspace with a laptop and notes",
    coverImageCaption: "A focused workspace for product work.",
    lessonsLearned:
      "Small, opinionated surfaces are easier to keep fresh than sprawling profile pages.",
    technologies: ["Next.js", "Supabase", "Tailwind CSS"],
    tags: ["portfolio", "identity", "saas"],
    links: [
      { kind: "live" as const, url: "https://nodivra.example.com/studio" },
      { kind: "repository" as const, url: "https://github.com/janedev/nodivra-studio" },
      { kind: "demo" as const, url: "https://demo.example.com/nodivra-studio" },
    ],
    isFeatured: true,
    isVisible: true,
    isPublished: true,
  },
  {
    slug: "atlas-ops-cli",
    title: "Atlas Ops CLI",
    summary: "A developer workflow tool for scaffolding repeatable deployment operations.",
    caseStudyMd: `## Why it exists

Operations work often drifted into ad hoc scripts. Atlas Ops CLI made the important flows repeatable.

## What changed

1. Standardized environment setup.
2. Reduced copy-paste during releases.
3. Added safer defaults for teams moving fast.

## What shipped

The CLI started as a small internal tool and became the foundation for a shared release workflow.`,
    role: "Internal tooling and automation",
    projectType: "tool",
    status: "in_progress",
    startDate: "2026-03-10",
    endDate: null,
    coverImageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt: "Close-up of a code editor and keyboard",
    coverImageCaption: "A compact utility built for repeatable ops.",
    lessonsLearned:
      "The smaller the workflow surface, the easier it is to keep it safe and predictable.",
    technologies: ["TypeScript", "Node.js", "Commander"],
    tags: ["cli", "automation", "internal"],
    links: [
      { kind: "repository" as const, url: "https://github.com/janedev/atlas-ops-cli" },
    ],
    isFeatured: true,
    isVisible: true,
    isPublished: true,
  },
  {
    slug: "paper-trail-system",
    title: "Paper Trail System",
    summary: "A component and content system for long-form product storytelling.",
    caseStudyMd: `## The brief

Create a reusable visual language for feature writeups, launch pages, and long-form narratives.

## The decision

The system leaned on strict hierarchy, quiet texture, and strong spacing rather than dense ornament.

## The result

It became a reliable base for product pages that needed to read like a magazine spread without losing clarity.`,
    role: "Design system and content architecture",
    projectType: "design_system",
    status: "archived",
    startDate: "2025-09-01",
    endDate: "2026-02-15",
    coverImageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    coverImageAlt: "Minimal desk with notebooks and a keyboard",
    coverImageCaption: "A quieter visual language for long-form pages.",
    lessonsLearned:
      "A narrow system can still feel expressive when the typography and spacing are disciplined.",
    technologies: ["Figma", "TypeScript", "CSS"],
    tags: ["design-system", "editorial", "case-study"],
    links: [
      { kind: "live" as const, url: "https://papertrail.example.com" },
    ],
    isFeatured: false,
    isVisible: true,
    isPublished: true,
  },
];

async function seed() {
  console.log("Seeding database...");

  const user = await ensureUser();
  const profile = await ensureProfile(user.id);
  await seedProfileData(profile);

  console.log("Seed complete.");
  console.log(`Email: ${EMAIL}`);
  console.log(`Password: ${PASSWORD}`);
  console.log(`Public page: /u/${profile.handle}`);
  console.log(`Projects: /u/${profile.handle}/projects`);
}

async function ensureUser() {
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(listError.message);
  }

  const existingUser = listData.users.find((user) => user.email === EMAIL);
  if (existingUser) {
    return existingUser;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Unable to create seed user");
  }

  return data.user;
}

async function ensureProfile(userId: string): Promise<ProfileRow> {
  const { data: existingProfile, error: profileQueryError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (profileQueryError) {
    throw new Error(profileQueryError.message);
  }

  if (existingProfile) {
    return existingProfile;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      handle: "jane-dev",
      display_name: "Jane Developer",
      headline: "Full-stack engineer and product designer",
      bio: "Building tools for developers. I like TypeScript, thoughtful systems, and clean case studies.",
      location: "San Francisco, CA",
      timezone: "America/Los_Angeles",
      avatar_initials: "JD",
      primary_cta_label: "Work with me",
      primary_cta_url: "https://example.com/contact",
      is_available: true,
      is_published: true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function seedProfileData(profile: ProfileRow) {
  await ensureLinks(profile.id);
  await ensureSettings(profile.id);

  const sections = await ensureSections(profile.id);
  const projects = await ensureProjects(profile.id);

  await ensureBlocks(profile.id, sections, projects);
}

async function ensureLinks(profileId: string) {
  const { data: existingLinks, error } = await supabase
    .from("profile_links")
    .select("id")
    .eq("profile_id", profileId)
    .is("deleted_at", null)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (existingLinks && existingLinks.length > 0) {
    return;
  }

  const { error: insertError } = await supabase.from("profile_links").insert(
    DEFAULT_LINKS.map((link, index) => ({
      profile_id: profileId,
      title: link.title,
      url: link.url,
      icon_label: link.icon_label,
      position: index,
      is_visible: true,
      is_enabled: true,
    }))
  );

  if (insertError) {
    throw new Error(insertError.message);
  }
}

async function ensureSettings(profileId: string) {
  const { data: existingSettings, error } = await supabase
    .from("public_profile_settings")
    .select("id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (existingSettings) {
    return;
  }

  const { error: insertError } = await supabase
    .from("public_profile_settings")
    .insert({
      profile_id: profileId,
      ...DEFAULT_SETTINGS,
    });

  if (insertError) {
    throw new Error(insertError.message);
  }
}

async function ensureSections(profileId: string) {
  const { data: existingSections, error } = await supabase
    .from("page_sections")
    .select("*")
    .eq("profile_id", profileId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  const bySlug = new Map<string, SectionRow>();
  for (const section of existingSections ?? []) {
    bySlug.set(section.slug, section);
  }

  const nextPosition = (existingSections?.length ?? 0) > 0
    ? Math.max(...(existingSections ?? []).map((section) => section.position)) + 1
    : 0;

  const missingSections = DEFAULT_SECTIONS.filter((section) => !bySlug.has(section.slug)).map(
    (section, index) => ({
      profile_id: profileId,
      title: section.title,
      slug: section.slug,
      position: nextPosition + index,
      is_visible: section.is_visible,
      is_collapsed_in_editor: section.is_collapsed_in_editor,
    })
  );

  if (missingSections.length > 0) {
    const { error: insertError } = await supabase
      .from("page_sections")
      .insert(missingSections);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  const { data: sections, error: refetchError } = await supabase
    .from("page_sections")
    .select("*")
    .eq("profile_id", profileId)
    .is("deleted_at", null);

  if (refetchError) {
    throw new Error(refetchError.message);
  }

  const sectionMap = new Map<string, SectionRow>();
  for (const section of sections ?? []) {
    sectionMap.set(section.slug, section);
  }

  return sectionMap;
}

async function ensureProjects(profileId: string) {
  const { data: existingProjects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("profile_id", profileId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  const bySlug = new Map<string, ProjectRow>();
  for (const project of existingProjects ?? []) {
    bySlug.set(project.slug, project);
  }

  const nextPosition =
    (existingProjects?.length ?? 0) > 0
      ? Math.max(...(existingProjects ?? []).map((project) => project.position)) + 1
      : 0;

  const missingProjects = DEFAULT_PROJECTS.filter((project) => !bySlug.has(project.slug));

  for (let index = 0; index < missingProjects.length; index += 1) {
    const project = missingProjects[index];
    const { data, error: insertError } = await supabase
      .from("projects")
      .insert({
        profile_id: profileId,
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        case_study_md: project.caseStudyMd,
        role: project.role,
        project_type: project.projectType,
        status: project.status,
        start_date: project.startDate,
        end_date: project.endDate,
        cover_image_url: project.coverImageUrl,
        cover_image_alt: project.coverImageAlt,
        cover_image_caption: project.coverImageCaption,
        lessons_learned: project.lessonsLearned,
        position: nextPosition + index,
        is_featured: project.isFeatured,
        is_visible: project.isVisible,
        is_published: project.isPublished,
      })
      .select("*")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    bySlug.set(data.slug, data);
  }

  const { data: refetchedProjects, error: refetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("profile_id", profileId)
    .is("deleted_at", null);

  if (refetchError) {
    throw new Error(refetchError.message);
  }

  const projectMap = new Map<string, ProjectRow>();
  for (const project of refetchedProjects ?? []) {
    projectMap.set(project.slug, project);
  }

  await Promise.all(
    DEFAULT_PROJECTS.map((project) => seedProjectChildren(projectMap.get(project.slug)))
  );

  return projectMap;
}

async function seedProjectChildren(project: ProjectRow | undefined) {
  if (!project) {
    return;
  }

  const [technologiesResult, tagsResult, linksResult] = await Promise.all([
    supabase
      .from("project_technologies")
      .select("id")
      .eq("project_id", project.id)
      .is("deleted_at", null)
      .limit(1),
    supabase
      .from("project_tags")
      .select("id")
      .eq("project_id", project.id)
      .is("deleted_at", null)
      .limit(1),
    supabase
      .from("project_links")
      .select("id")
      .eq("project_id", project.id)
      .is("deleted_at", null)
      .limit(1),
  ]);

  if (technologiesResult.error) {
    throw new Error(technologiesResult.error.message);
  }
  if (tagsResult.error) {
    throw new Error(tagsResult.error.message);
  }
  if (linksResult.error) {
    throw new Error(linksResult.error.message);
  }

  const projectSeed = DEFAULT_PROJECTS.find((item) => item.slug === project.slug);
  if (!projectSeed) {
    return;
  }

  if (!technologiesResult.data || technologiesResult.data.length === 0) {
    const { error: insertError } = await supabase.from("project_technologies").insert(
      projectSeed.technologies.map((name, index) => ({
        project_id: project.id,
        name,
        position: index,
      }))
    );

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  if (!tagsResult.data || tagsResult.data.length === 0) {
    const { error: insertError } = await supabase.from("project_tags").insert(
      projectSeed.tags.map((name, index) => ({
        project_id: project.id,
        name,
        position: index,
      }))
    );

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  if (!linksResult.data || linksResult.data.length === 0) {
    const { error: insertError } = await supabase.from("project_links").insert(
      projectSeed.links.map((link, index) => ({
        project_id: project.id,
        kind: link.kind,
        url: link.url,
        position: index,
        is_visible: true,
      }))
    );

    if (insertError) {
      throw new Error(insertError.message);
    }
  }
}

async function ensureBlocks(
  profileId: string,
  sections: Map<string, SectionRow>,
  projects: Map<string, ProjectRow>
) {
  const { data: existingBlocks, error } = await supabase
    .from("page_blocks")
    .select("id")
    .eq("profile_id", profileId)
    .is("deleted_at", null)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (existingBlocks && existingBlocks.length > 0) {
    return;
  }

  const about = sections.get("about");
  const work = sections.get("work");
  const writing = sections.get("writing");
  const contact = sections.get("contact");
  const elsewhere = sections.get("elsewhere");
  const studioProject = projects.get("nodivra-studio");

  const pageBlocks = [
    {
      profile_id: profileId,
      section_id: about?.id ?? null,
      block_type: "text_section",
      title: "About Me",
      position: 0,
      is_visible: true,
      config: {
        body: "I build product surfaces that feel careful, fast, and easy to keep up to date.",
        format: "plain",
      },
    },
    {
      profile_id: profileId,
      section_id: about?.id ?? null,
      block_type: "image_card",
      title: "Workspace",
      position: 1,
      is_visible: true,
      config: {
        src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        alt: "A clean developer workspace",
        caption: "A quiet desk for product work.",
        aspect_ratio: "16:9",
      },
    },
    {
      profile_id: profileId,
      section_id: work?.id ?? null,
      block_type: "project_highlight",
      title: "Featured project",
      position: 0,
      is_visible: true,
      config: {
        project_id: studioProject?.id ?? null,
        name: "Nodivra Studio",
        description: "A premium identity builder for developers.",
        url: "https://nodivra.example.com/studio",
        repo_url: "https://github.com/janedev/nodivra-studio",
        technologies: ["Next.js", "Supabase", "Tailwind CSS"],
        status: "active",
      },
    },
    {
      profile_id: profileId,
      section_id: writing?.id ?? null,
      block_type: "external_resource",
      title: "Latest Article",
      position: 0,
      is_visible: true,
      config: {
        url: "https://blog.example.com/scaling-typescript",
        title: "Scaling TypeScript in Large Codebases",
        description: "Lessons learned maintaining a large TypeScript monorepo.",
        source: "Personal Blog",
      },
    },
    {
      profile_id: profileId,
      section_id: contact?.id ?? null,
      block_type: "availability_card",
      title: "Availability",
      position: 0,
      is_visible: true,
      config: {
        status: "available",
        message: "Open to freelance projects and product collaborations",
      },
    },
    {
      profile_id: profileId,
      section_id: contact?.id ?? null,
      block_type: "cta_card",
      title: "Hire Me",
      position: 1,
      is_visible: true,
      config: {
        heading: "Let's build something useful",
        body: "Available for product work, design systems, and developer experience projects.",
        button_label: "Get in touch",
        button_url: "https://example.com/contact",
      },
    },
    {
      profile_id: profileId,
      section_id: elsewhere?.id ?? null,
      block_type: "social_link",
      title: "Mastodon",
      position: 0,
      is_visible: true,
      config: {
        url: "https://mastodon.social/@janedev",
        platform: "Mastodon",
        username: "@janedev",
      },
    },
    {
      profile_id: profileId,
      section_id: elsewhere?.id ?? null,
      block_type: "link_button",
      title: "GitHub",
      position: 1,
      is_visible: true,
      config: {
        url: "https://github.com/janedev",
        label: "GitHub",
        icon: "->",
        style: "outline",
      },
    },
    {
      profile_id: profileId,
      section_id: null,
      block_type: "divider",
      title: "Divider",
      position: 0,
      is_visible: true,
      config: { style: "dots" },
    },
  ];

  const { error: insertError } = await supabase.from("page_blocks").insert(pageBlocks);

  if (insertError) {
    throw new Error(insertError.message);
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
