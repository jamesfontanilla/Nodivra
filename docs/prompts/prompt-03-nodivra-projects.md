Implement Nodivra Projects as a developer case-study module.

Allow developers to create project entries with project name, short summary, detailed Markdown case study, role, technologies, project type, start date, end date, status, cover image reference, live URL, repository URL, demo URL, lessons learned, and featured status.

Build project list, project editor, project detail preview, public project section, ordering controls, draft/published state, featured-project limit, and project linking from Nodivra Page and Nodivra Blocks.

Projects must be manually curated. Do not require GitHub, GitLab, deployment, issue tracker, or analytics integrations. Repository and live-demo links must be optional and validated as http/https links.

Create tables for projects, project_technologies, project_links, and project_tags. Use RLS so private projects remain private and only published projects appear publicly.

Sanitize Markdown output, enforce content-size limits, support small optional images, and add SEO metadata for public project pages.

Include seed case studies, pagination, Search-ready text fields, audit events, tests for visibility and ownership, mobile layouts, loading/error/empty states, and README documentation.