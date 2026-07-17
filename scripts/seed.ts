/**
 * Seed script for local development.
 * Requires SUPABASE_SERVICE_ROLE_KEY in environment.
 *
 * Usage: npx tsx scripts/seed.ts
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log("🌱 Seeding database...");

  // Create a test user
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: "dev@nodivra.test",
      password: "password123",
      email_confirm: true,
    });

  if (authError && !authError.message.includes("already")) {
    console.error("Error creating user:", authError.message);
    process.exit(1);
  }

  const userId = authData?.user?.id;
  if (!userId) {
    console.log("User may already exist, attempting to find...");
    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users?.users?.find(
      (u) => u.email === "dev@nodivra.test"
    );
    if (!existingUser) {
      console.error("Cannot find or create test user");
      process.exit(1);
    }
    await seedProfile(existingUser.id);
    return;
  }

  await seedProfile(userId);
}

async function seedProfile(userId: string) {
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existingProfile) {
    console.log("Profile already exists, skipping...");
    return;
  }

  // Create profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      handle: "jane-dev",
      display_name: "Jane Developer",
      headline: "Full-stack engineer · Open source contributor",
      bio: "Building tools for developers. Love TypeScript, Rust, and distributed systems. Available for interesting projects.",
      location: "San Francisco, CA",
      timezone: "America/Los_Angeles",
      avatar_initials: "JD",
      primary_cta_label: "Work with me",
      primary_cta_url: "https://example.com/contact",
      is_available: true,
      is_published: true,
    })
    .select()
    .single();

  if (profileError) {
    console.error("Error creating profile:", profileError.message);
    process.exit(1);
  }

  console.log(`✅ Created profile: /u/${profile.handle}`);

  // Create links
  const links = [
    {
      profile_id: profile.id,
      title: "GitHub",
      url: "https://github.com/janedev",
      icon_label: "🐙",
      position: 0,
    },
    {
      profile_id: profile.id,
      title: "Blog",
      url: "https://blog.example.com",
      icon_label: "✍️",
      position: 1,
    },
    {
      profile_id: profile.id,
      title: "Twitter / X",
      url: "https://x.com/janedev",
      icon_label: "𝕏",
      position: 2,
    },
    {
      profile_id: profile.id,
      title: "LinkedIn",
      url: "https://linkedin.com/in/janedev",
      icon_label: "💼",
      position: 3,
    },
    {
      profile_id: profile.id,
      title: "Latest Project",
      url: "https://example.com/project",
      icon_label: "🚀",
      position: 4,
    },
  ];

  const { error: linksError } = await supabase
    .from("profile_links")
    .insert(links);

  if (linksError) {
    console.error("Error creating links:", linksError.message);
  } else {
    console.log(`✅ Created ${links.length} links`);
  }

  // Create profile settings
  const { error: settingsError } = await supabase
    .from("public_profile_settings")
    .insert({
      profile_id: profile.id,
      show_location: true,
      show_timezone: true,
      show_availability: true,
      theme: "default",
    });

  if (settingsError) {
    console.error("Error creating settings:", settingsError.message);
  } else {
    console.log("✅ Created profile settings");
  }

  // Create page blocks
  const pageBlocks = [
    {
      profile_id: profile.id,
      block_type: "text_section",
      title: "About Me",
      position: 0,
      is_visible: true,
      config: { body: "I'm a full-stack engineer passionate about building tools that make developers more productive. Currently focused on TypeScript, distributed systems, and developer experience.", format: "plain" },
    },
    {
      profile_id: profile.id,
      block_type: "project_highlight",
      title: "DevTools CLI",
      position: 1,
      is_visible: true,
      config: { name: "DevTools CLI", description: "A blazing-fast command-line toolkit for scaffolding full-stack projects", url: "https://example.com/devtools", technologies: ["Rust", "TypeScript", "Node.js"], status: "active" },
    },
    {
      profile_id: profile.id,
      block_type: "project_highlight",
      title: "CloudSync",
      position: 2,
      is_visible: true,
      config: { name: "CloudSync", description: "Real-time file synchronization across development environments", repo_url: "https://github.com/janedev/cloudsync", technologies: ["Go", "gRPC", "PostgreSQL"], status: "wip" },
    },
    {
      profile_id: profile.id,
      block_type: "availability_card",
      title: "Availability",
      position: 3,
      is_visible: true,
      config: { status: "available", message: "Open to freelance projects and consulting" },
    },
    {
      profile_id: profile.id,
      block_type: "cta_card",
      title: "Hire Me",
      position: 4,
      is_visible: true,
      config: { heading: "Let's build something great", body: "I'm available for freelance work and technical consulting.", button_label: "Get in touch", button_url: "https://example.com/contact" },
    },
    {
      profile_id: profile.id,
      block_type: "external_resource",
      title: "Latest Article",
      position: 5,
      is_visible: true,
      config: { url: "https://blog.example.com/scaling-typescript", title: "Scaling TypeScript in Large Codebases", description: "Lessons learned maintaining a 500k LOC TypeScript monorepo", source: "Personal Blog" },
    },
    {
      profile_id: profile.id,
      block_type: "divider",
      title: "Divider",
      position: 6,
      is_visible: true,
      config: { style: "dots" },
    },
    {
      profile_id: profile.id,
      block_type: "social_link",
      title: "Mastodon",
      position: 7,
      is_visible: true,
      config: { url: "https://mastodon.social/@janedev", platform: "Mastodon", username: "@janedev" },
    },
  ];

  const { error: blocksError } = await supabase
    .from("page_blocks")
    .insert(pageBlocks);

  if (blocksError) {
    console.error("Error creating blocks:", blocksError.message);
  } else {
    console.log(`✅ Created ${pageBlocks.length} page blocks`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("   Email: dev@nodivra.test");
  console.log("   Password: password123");
  console.log(`   Public page: /u/${profile.handle}`);
}

seed().catch(console.error);
