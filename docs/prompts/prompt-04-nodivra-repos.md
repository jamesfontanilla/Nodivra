Implement Nodivra Repos as a manually curated repository showcase.

Developers must be able to add repository records with name, provider label, repository URL, description, language, framework, topics, stars text, fork text, activity label, status, featured status, and display order. All metadata must be entered manually so the product does not depend on GitHub or GitLab APIs.

Build repository list, repository editor, featured repository cards, public repository section, filters by language and topic, and links to related Projects and Stack items.

Create tables for repositories, repository_topics, repository_languages, and repository_links. Validate URLs, enforce ownership, support draft/published state, and prevent duplicated URLs for the same profile.

Do not claim that repository statistics are live. Label manually entered statistics clearly and allow developers to hide them. Never scrape or proxy repository pages.

Integrate repositories into the public profile page and universal profile search later. Add seed data, RLS, audit logs, pagination, empty states, responsive card layouts, tests for public/private visibility, and documentation.

Keep the module lightweight and safe for Supabase Free. Do not add background syncing, webhooks, scheduled jobs, or external API keys.