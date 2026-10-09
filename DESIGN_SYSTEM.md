# Matias AI — Creative Studio Operating System
## UI & Visual Design System Specification

### 1. Visual Character & Philosophy
The interface is engineered as an **Intelligent Creative Studio Operating System**, not a typical admin dashboard or generic AI chatbot:
- **Editorial & Minimal**: Generous negative space, large sans-serif typography, high contrast, and calm natural-language phrasing (`"Good morning, Matias."` rather than `"DASHBOARD OVERVIEW"`).
- **Spatial & Floating**: Cards feel like floating surfaces on a warm off-white canvas with 20px–28px rounded corners and subtle hairline borders (`#E5E5E1`).
- **High-Contrast Compositions**: Inspired by Reference 1, deep black surfaces (`#121212`) anchor critical telemetry and real-time autonomous workloads without visual clutter.
- **Embedded AI**: Intelligence is communicated through hierarchy, persistent state pills, and operating logs rather than glowing gimmicks.

---

### 2. Design System Tokens

#### Color Palette
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `Canvas (Background)` | `#F5F5F3` | Warm neutral / off-white base surface |
| `Surface (Primary)` | `#FFFFFF` | Floating card canvas, high elevation |
| `Surface (Secondary)` | `#F0F0EE` | Soft pills, inactive cards, subtle containers |
| `Surface (Dark)` | `#121212` | High-contrast telemetry cards (Ref 1 inspired) |
| `Ink (Primary Text)` | `#111111` | Primary editorial headings, titles, data figures |
| `Ink (Secondary Text)` | `#6F6F6B` | Descriptive text, contextual metadata |
| `Ink (Muted)` | `#9A9A95` | Timestamps, micro labels, badges |
| `Border` | `#E5E5E1` | Subtle 1px dividing borders |
| `Border Dark` | `#2A2A28` | Borders on dark high-contrast components |
| `Accent / Status` | `#10B981` / `#D97706` | Status dots (Online, Waiting, Attention) |

#### Typography
- **Typeface**: Inter / Geist (Neo-grotesk sans-serif).
- **Scale**:
  - `Display / Greeting`: 48px – 56px (`font-light` with `font-semibold` accents)
  - `Section Titles`: 24px – 28px (`font-light` / `font-normal`)
  - `Card Headlines`: 16px – 20px (`font-normal` / `font-medium`)
  - `Body / Metadata`: 12px – 14px (`font-light` / `font-medium`)
  - `Micro / Telemetry`: 10px – 11px (`font-mono` / `font-semibold uppercase tracking-wider`)
- **Tone**: Sentence case only; no aggressive uppercase headings.

#### Card Architecture
- `border-radius: 24px` (`rounded-card`) to `28px` (`rounded-card-lg`).
- `box-shadow`: Soft multi-stop ambient diffusion (`0 12px 36px -8px rgba(17, 17, 17, 0.06)`).
- Generous internal padding (24px to 32px).

---

### 3. Application Architecture & Views

1. **Integrated Left Sidebar**:
   - Navigation: `Dashboard`, `Clients`, `Projects`, `Tasks`, `Agents`, `Memory`, `Documents`, `Approvals`, `Activity`.
   - Subtle pill hover and active states.
   - Micro-telemetry widget displaying active autonomous engines.

2. **Top Studio Header**:
   - Current page breadcrumb.
   - Minimal global search input with `⌘K` keyboard trigger.
   - Persistent, interactive AI status indicator:
     - `● AI Employee online`
     - `● Working on XYZ AI`
     - `○ Waiting for approval`
     - `● Needs attention`
   - Studio notification bell with real-time dot indicator.
   - User profile badge (`Matias`).

3. **Dashboard (Command Center)**:
   - Large greeting & system status banner (`Good morning, Matias.`).
   - Primary area: Chronological AI Operating Activity Log (`09:42 Read brief`, `09:44 Loaded brand memory`, `09:46 Opened Figma reference`, `09:51 Draft ready for review`).
   - High-contrast telemetry card (Workload distribution, knowledge nodes, studio velocity).
   - Secondary modules: Human-in-the-loop pending approvals, active projects, and client status.

4. **Clients & Dedicated Client Workspace**:
   - Spacious editorial list & large preview cards.
   - Dedicated client workspace with sub-navigation: `Overview`, `Brand`, `Projects`, `Memory`, `Documents`, `Communication`, `Commercial`, `Activity`.
   - Structured knowledge presentation for Brand Personality, Communication Tone, and Visual Language.

5. **Approvals (Human-in-the-Loop)**:
   - Calm, intentional review card and modal.
   - Details: Proposed action, client, reason, generated dispatch payload.
   - Actions: `[Approve & Dispatch]`, `[Edit Before Sending]`, `[Reject]`.

6. **Projects & Tasks**:
   - Large project workspace cards with completion meters and agent assignments.
   - High-clarity operational task ledger avoiding dense kanban boards.

7. **Agents & Memory**:
   - Synthetic workforce overview (Creative Director, Design Agent, Memory Engine, Research Agent, Client Liaison).
   - Structured memory graph with source attribution and confidence ratings.
