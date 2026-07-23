# Color System

Reference for every color used on the site: what it's named, what it's for, and its value in each theme. Use the **token names** (the `--name` column) when giving feedback on a specific area ("the `--nav-bg` looks off" is unambiguous; "the blue part" isn't) — see the cheat sheet at the bottom for plain-English → token mapping.

All tokens are defined once in `styles.css` (`:root` for light, `:root[data-theme="dark"]` for dark) and used everywhere else in the CSS by name, never as raw hex values, so a color only ever needs to change in one place.

## Brand colors (fixed, don't change between themes)

| Name | Hex | Used for |
|---|---|---|
| `--river-blue` | `#1B5E9E` | Primary brand blue. The nav/footer band in light mode, the hero/CTA band in dark mode, the homepage button card always, and most buttons/links. |
| `--azalea-pink` | `#D6448E` | Secondary brand accent. Headings, tags, primary buttons, link hover, the footer's top border. |
| `--dark-river` | `#0F3D6B` | Deepest brand blue. Page background in dark mode, heading text in light mode. |
| `--light-azalea` | `#F2D0E2` | Pale pink. Link hover in dark mode, the calendar's "today" highlight. |
| `--slate-text` | `#2D3748` | Body text color in light mode. |
| `--mist-gray` | `#E8ECF1` | Rarely used directly; mostly superseded by the light-theme surface tokens below. |
| `--clean-white` | `#FFFFFF` | Pure white. Skip link, button text, nav icon/text (works on both themes' nav backgrounds). |

## Semantic tokens (these are what actually change between themes)

| Token | Role | Light value | Dark value |
|---|---|---|---|
| `--page-bg` | Main page background, most sections | `#E7F2FB` pale ice blue | `#0F3D6B` (`--dark-river`) |
| `--surface` | Raised cards, event cards, gallery items | `#FFFFFF` white | `#17548C` |
| `--nav-bg` | Nav bar background | `#1B5E9E` (`--river-blue`) | `#0A2C4E` near-black navy |
| `--footer-bg` | Footer background | `#1B5E9E` (`--river-blue`) | `#0A2C4E` near-black navy |
| `--hero-bg` | Page-title band + closing CTA band (the `.hero` class) | `#FFFFFF` white | `#1B5E9E` (`--river-blue`) |
| `--text` | Default body text | `#2D3748` (`--slate-text`) | `#E6EEF6` near-white |
| `--text-muted` | De-emphasized text (intro paragraphs, event details, table headers) | `#55697F` | `#A9BFD3` |
| `--heading` | Non-h1–h4 headings that aren't pink (event card titles, calendar nav, form labels) | `#0F3D6B` (`--dark-river`) | `#F1F7FC` near-white |
| `--card-heading` | Card `<h3>` titles | `#1B5E9E` (`--river-blue`) | `#7FBDEB` light sky blue |
| `--link` | Link text color | `#1B5E9E` (`--river-blue`) | `#7FBDEB` light sky blue |
| `--link-hover` | Link hover color | `#D6448E` (`--azalea-pink`) | `#F2D0E2` (`--light-azalea`) |
| `--border` | Card outlines, table cell borders | navy at 16% opacity | white at 14% opacity |
| `--input-bg` | Form field backgrounds | `#FFFFFF` white | `#0B3057` deep navy |

## The design principle behind the theme switch

`--river-blue` is the site's one saturated, fully-brand-colored band — it always appears exactly once as a solid band framing the page, never zero times and never twice. In light mode it's the nav and footer (bookending a pale-blue page, with the hero/CTA bands popping brighter still at pure white). In dark mode it moves to the hero/CTA bands (standing out against a darker page), and the nav/footer instead drop to an even darker navy. Everything else in each theme is built around wherever that one band landed. If you're ever unsure whether a new component should use `--river-blue` directly or a semantic token, ask: is this meant to always look the same regardless of theme (→ raw `--river-blue`, like the homepage button card), or should it adapt (→ a semantic token)?

## Plain-English → token cheat sheet

Use this to point at something without needing to inspect the CSS:

- "The banner at the top with the logo and menu" → `--nav-bg`
- "The pale/colored band right under the nav with the page title" → `--hero-bg` (first use)
- "The dark/white space most of the page content sits in" → `--page-bg`
- "The boxes that hold events/cards, slightly different from the page behind them" → `--surface`
- "The colored strip right before the footer, usually with a button" → `--hero-bg` (second use, same token as the page-title band)
- "The bar at the very bottom with the links and copyright" → `--footer-bg`
- "The thin lines around cards/table cells" → `--border`
- "The boxes you type into on a form" → `--input-bg`
- "The main paragraph text color" → `--text`
- "The smaller, grayer text under headings" → `--text-muted`
