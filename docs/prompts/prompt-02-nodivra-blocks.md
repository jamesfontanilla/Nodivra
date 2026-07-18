Implement Nodivra Blocks to expand the basic link page into a flexible developer page builder.

Support ordered page sections and reusable block types:

- Link button
- Social link
- Project highlight
- Text section
- Image card
- Divider
- Call-to-action card
- Availability card
- Embed-free external resource card

Do not allow arbitrary HTML, JavaScript, CSS, iframe embeds, or unsafe media. External content must be represented as safe links and metadata.

Create a block editor with add, edit, duplicate, delete, reorder, hide, show, and preview actions. Use typed JSONB configuration only when validated against strict schemas. Every block must have a type, position, visibility, title, and configuration payload.

Add sections so developers can group content into areas such as About, Work, Writing, Contact, and Elsewhere. Support collapsed sections in the editor and responsive rendering on the public page.

Implement database migrations, RLS, server-side validation, ownership checks, public published rendering, seed data, audit logging, tests for block validation and ordering, accessibility checks, and documentation.

Keep public page queries bounded and efficient. The page builder must work without external services or paid APIs.