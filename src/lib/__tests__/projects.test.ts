import { describe, expect, it } from "vitest";
import {
  buildUniqueProjectSlug,
  filterPublicProjects,
  formatProjectDateRange,
  getNextProjectPosition,
  getProjectLink,
  groupProjectDetails,
  isProjectOwnedByProfile,
  isProjectPublic,
  slugifyProjectTitle,
  sortProjectDetails,
  sortProjectLinks,
  sortProjectTags,
  sortProjectTechnologies,
  sortProjects,
  type Project,
  type ProjectLink,
  type ProjectTag,
  type ProjectTechnology,
  type ProjectVisibilityProfile,
} from "../projects";

function createProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "project-1",
    profile_id: "profile-1",
    title: "Nodivra",
    slug: "nodivra",
    summary: "A developer portfolio platform",
    case_study_md: "# Case study\n\nWe shipped it.",
    role: "Founder",
    project_type: "web_app",
    status: "shipped",
    start_date: "2026-01-01",
    end_date: "2026-03-01",
    cover_image_url: "https://example.com/cover.png",
    cover_image_alt: "Cover image",
    cover_image_caption: "A clean product preview",
    lessons_learned: "Ship the smallest useful thing first.",
    search_text: "nodivra developer portfolio platform",
    position: 0,
    is_featured: false,
    is_visible: true,
    is_published: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

function createTechnology(
  overrides: Partial<ProjectTechnology> = {}
): ProjectTechnology {
  return {
    id: "tech-1",
    project_id: "project-1",
    name: "TypeScript",
    position: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

function createTag(overrides: Partial<ProjectTag> = {}): ProjectTag {
  return {
    id: "tag-1",
    project_id: "project-1",
    name: "Portfolio",
    position: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

function createLink(overrides: Partial<ProjectLink> = {}): ProjectLink {
  return {
    id: "link-1",
    project_id: "project-1",
    kind: "live",
    url: "https://example.com",
    position: 0,
    is_visible: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

describe("project helpers", () => {
  it("slugifies titles and avoids collisions", () => {
    expect(slugifyProjectTitle("Hello World")).toBe("hello-world");
    expect(slugifyProjectTitle("123 AI Tool")).toBe("project-123-ai-tool");
    expect(buildUniqueProjectSlug("Hello World", ["hello-world"])).toBe(
      "hello-world-2"
    );
  });

  it("sorts projects, children, and grouped details consistently", () => {
    const projectA = createProject({
      id: "a",
      position: 1,
      created_at: "2026-01-02T00:00:00.000Z",
      slug: "alpha",
      title: "Alpha",
    });
    const projectB = createProject({
      id: "b",
      position: 0,
      created_at: "2026-01-01T00:00:00.000Z",
      slug: "beta",
      title: "Beta",
    });
    const projectC = createProject({
      id: "c",
      position: 0,
      created_at: "2026-01-01T00:00:00.000Z",
      slug: "gamma",
      title: "Gamma",
    });

    expect(sortProjects([projectA, projectC, projectB]).map((project) => project.id)).toEqual([
      "b",
      "c",
      "a",
    ]);
    expect(getNextProjectPosition([projectA, projectB])).toBe(2);
    expect(getNextProjectPosition([])).toBe(0);

    const details = groupProjectDetails(
      [projectA, projectB],
      [
        createTechnology({ id: "tech-b", project_id: "b", position: 1, name: "React" }),
        createTechnology({ id: "tech-a", project_id: "b", position: 0, name: "TypeScript" }),
      ],
      [
        createTag({ id: "tag-b", project_id: "b", position: 1, name: "Design" }),
        createTag({ id: "tag-a", project_id: "b", position: 0, name: "Portfolio" }),
      ],
      [
        createLink({ id: "link-b", project_id: "b", position: 1, kind: "repository" }),
        createLink({ id: "link-a", project_id: "b", position: 0, kind: "live" }),
      ]
    );

    expect(details.map((detail) => detail.project.id)).toEqual(["b", "a"]);
    expect(details[0].technologies.map((item) => item.name)).toEqual([
      "TypeScript",
      "React",
    ]);
    expect(details[0].tags.map((item) => item.name)).toEqual([
      "Portfolio",
      "Design",
    ]);
    expect(details[0].links.map((item) => item.kind)).toEqual([
      "live",
      "repository",
    ]);
    expect(sortProjectDetails(details).map((detail) => detail.project.id)).toEqual([
      "b",
      "a",
    ]);
    expect(sortProjectTechnologies(details[0].technologies).map((item) => item.id)).toEqual([
      "tech-a",
      "tech-b",
    ]);
    expect(sortProjectTags(details[0].tags).map((item) => item.id)).toEqual([
      "tag-a",
      "tag-b",
    ]);
    expect(sortProjectLinks(details[0].links).map((item) => item.id)).toEqual([
      "link-a",
      "link-b",
    ]);
    expect(getProjectLink(details[0].links, "repository")?.id).toBe("link-b");
  });

  it("evaluates public visibility and ownership correctly", () => {
    const project = createProject();
    const visibleProfile: ProjectVisibilityProfile = {
      is_published: true,
      deleted_at: null,
    };

    expect(isProjectOwnedByProfile(project, "profile-1")).toBe(true);
    expect(isProjectOwnedByProfile(project, "profile-2")).toBe(false);
    expect(isProjectPublic(project, visibleProfile)).toBe(true);
    expect(
      isProjectPublic(project, {
        is_published: false,
        deleted_at: null,
      })
    ).toBe(false);
    expect(
      isProjectPublic(
        createProject({
          is_visible: false,
        }),
        visibleProfile
      )
    ).toBe(false);
  });

  it("filters to public projects only", () => {
    const visibleProject = createProject({
      id: "visible",
      slug: "visible",
      position: 1,
    });
    const draftProject = createProject({
      id: "draft",
      slug: "draft",
      position: 0,
      is_published: false,
    });

    const filtered = filterPublicProjects([visibleProject, draftProject], {
      is_published: true,
      deleted_at: null,
    });

    expect(filtered.map((project) => project.id)).toEqual(["visible"]);
  });

  it("formats date ranges for common cases", () => {
    expect(formatProjectDateRange(createProject())).toContain("2026");
    expect(
      formatProjectDateRange(
        createProject({
          start_date: "2026-01-01",
          end_date: null,
        })
      )
    ).toContain("Present");
    expect(
      formatProjectDateRange(
        createProject({
          start_date: null,
          end_date: "2026-04-01",
        })
      )
    ).toContain("Until");
  });
});
