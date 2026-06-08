# Graph Report - .  (2026-06-07)

## Corpus Check
- Corpus is ~30,861 words - fits in a single context window. You may not need a graph.

## Summary
- 382 nodes · 632 edges · 28 communities (20 shown, 8 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 72 edges (avg confidence: 0.86)
- Token cost: 20,812 input · 5,080 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dashboard & KPI Widgets|Dashboard & KPI Widgets]]
- [[_COMMUNITY_CRUD Page Components|CRUD Page Components]]
- [[_COMMUNITY_Landing Page Animations|Landing Page Animations]]
- [[_COMMUNITY_NPM Dependencies|NPM Dependencies]]
- [[_COMMUNITY_CRUD Mutation Handlers|CRUD Mutation Handlers]]
- [[_COMMUNITY_Project Path Aliases|Project Path Aliases]]
- [[_COMMUNITY_Shared Utilities & UI Primitives|Shared Utilities & UI Primitives]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Build & Dev Dependencies|Build & Dev Dependencies]]
- [[_COMMUNITY_Dropdown Menu Components|Dropdown Menu Components]]
- [[_COMMUNITY_Button & Dialog Primitives|Button & Dialog Primitives]]
- [[_COMMUNITY_Form Select & Toggle Primitives|Form Select & Toggle Primitives]]
- [[_COMMUNITY_WebGL Shader Math|WebGL Shader Math]]
- [[_COMMUNITY_Layout & Navigation Shell|Layout & Navigation Shell]]
- [[_COMMUNITY_Card UI Components|Card UI Components]]
- [[_COMMUNITY_Auth Middleware & E2E Tests|Auth Middleware & E2E Tests]]
- [[_COMMUNITY_Progress Indicator|Progress Indicator]]
- [[_COMMUNITY_Next.js Project Config|Next.js Project Config]]
- [[_COMMUNITY_Tab Navigation Components|Tab Navigation Components]]
- [[_COMMUNITY_Text Input Primitives|Text Input Primitives]]
- [[_COMMUNITY_Claude Dev Config|Claude Dev Config]]
- [[_COMMUNITY_Landing Hero Image|Landing Hero Image]]
- [[_COMMUNITY_Badge Component|Badge Component]]
- [[_COMMUNITY_AI Document Extraction|AI Document Extraction]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_Permission Rules|Permission Rules]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 79 edges
2. `Supabase Client (browser)` - 24 edges
3. `createClient()` - 16 edges
4. `compilerOptions` - 15 edges
5. `createClient()` - 14 edges
6. `formatDate()` - 8 edges
7. `getUrgencyColor()` - 8 edges
8. `getCategoryColor()` - 7 edges
9. `Deadline` - 7 edges
10. `@base-ui/react primitives` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Row Level Security (Supabase)` --rationale_for--> `updateSession()`  [INFERRED]
  SETUP.md → src/lib/supabase/middleware.ts
- `Supabase documents storage bucket` --conceptually_related_to--> `Document`  [INFERRED]
  SETUP.md → src/types/index.ts
- `AdminOS Landing Page snapshot` --conceptually_related_to--> `middleware()`  [INFERRED]
  .playwright-mcp/page-2026-05-30T18-27-02-734Z.yml → src/middleware.ts
- `Anthropic API key (AI document extraction)` --conceptually_related_to--> `AIExtractionResult`  [INFERRED]
  SETUP.md → src/types/index.ts
- `tsconfig path aliases (@/*)` --conceptually_related_to--> `cn()`  [INFERRED]
  tsconfig.json → src/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Dashboard Parallel Data Aggregation from All Tables** — dashboard_page_dashboardpage, dashboard_dashboardclient, types_subscription, types_deadline, types_document, types_bill, types_appointment, types_warranty [EXTRACTED 1.00]
- **CRUD Client Component + Supabase Pattern** — appointments_appointmentsclient, bills_billsclient, deadlines_deadlinesclient, documents_documentsclient, lib_supabase_client [INFERRED 0.95]
- **Supabase Auth Flow (Login/Signup/Reset)** — login_page_loginpage, signup_page_signuppage, reset_password_page_resetpasswordpage, lib_supabase_client, auth_layout_authlayout [INFERRED 0.95]
- **AppShell Animation Orchestration (LenisProvider + CustomCursor + Preloader)** — components_appshell_appshell, animations_lenisprovider_lenisprovider, animations_customcursor_customcursor, animations_preloader_preloader [EXTRACTED 1.00]
- **Server-to-Client Data Fetching Pattern (Page → Client Component + Supabase)** — subscriptions_page_subscriptionspage, subscriptions_subscriptionsclient_subscriptionsclient, warranties_page_warrantiespage, warranties_warrantiesclient_warrantiesclient, concept_server_client_split [INFERRED 0.95]
- **Landing Page Hero Animation Pipeline (GSAP + HeroCanvas + HeroShaderScene)** — app_page_landingpage, animations_herocanvas_herocanvas, animations_heroshaderschene_heroshaderschene, concept_gsap_scroll_animation [INFERRED 0.85]
- **Supabase Auth Guard Pattern (client + server + middleware)** — supabase_client_createclient, supabase_server_createclient, supabase_middleware_updatesession, src_middleware_middleware [EXTRACTED 1.00]
- **Base UI Primitive Wrapper Pattern (all UI components)** — ui_input_input, ui_progress_progress, ui_select_select, ui_separator_separator, ui_switch_switch, ui_tabs_tabs, ui_tooltip_tooltip, base_ui_primitives, lib_utils_cn [INFERRED 0.95]
- **Domain Types & Urgency/Priority Utility Cohesion** — types_index_deadline, types_index_subscription, lib_utils_isoverdue, lib_utils_isexpiringsoon, lib_utils_getdaysuntil, lib_utils_geturgencycolor, lib_utils_getprioritybadge [INFERRED 0.85]

## Communities (28 total, 8 thin omitted)

### Community 0 - "Dashboard & KPI Widgets"
Cohesion: 0.07
Nodes (41): Shadcn/UI Component Config, AnimCountUp, DashboardClient(), glass, Props, stagger(), EmptyWidget, WidgetHeader (+33 more)

### Community 1 - "CRUD Page Components"
Cohesion: 0.08
Nodes (31): AppointmentsClient(), Props, AppointmentsPage(), AuthCallbackRoute (GET /auth/callback), BillsClient(), CATEGORIES, Props, BillsPage() (+23 more)

### Community 2 - "Landing Page Animations"
Cohesion: 0.09
Nodes (23): CustomCursor(), HeroCanvas(), HeroShaderScene, HeroShaderScene, LenisContext, LenisProvider(), useLenis(), Preloader() (+15 more)

### Community 3 - "NPM Dependencies"
Cohesion: 0.06
Nodes (31): dependencies, @anthropic-ai/sdk, @base-ui/react, class-variance-authority, clsx, date-fns, framer-motion, @google/generative-ai (+23 more)

### Community 4 - "CRUD Mutation Handlers"
Cohesion: 0.10
Nodes (24): AppointmentsClient.handleDelete, AppointmentsClient.handleSubmit, BillsClient.handleDelete, BillsClient.handleSubmit, BillsClient.togglePaid, DeadlinesClient.handleDelete, DeadlinesClient.handleSubmit, DeadlinesClient.toggleComplete (+16 more)

### Community 5 - "Project Path Aliases"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 6 - "Shared Utilities & UI Primitives"
Cohesion: 0.17
Nodes (18): cn(), tsconfig path aliases (@/*), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+10 more)

### Community 7 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "Build & Dev Dependencies"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-next, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+9 more)

### Community 9 - "Dropdown Menu Components"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 10 - "Button & Dialog Primitives"
Cohesion: 0.18
Nodes (9): Button(), buttonVariants, Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay() (+1 more)

### Community 11 - "Form Select & Toggle Primitives"
Cohesion: 0.17
Nodes (8): @base-ui/react primitives, Select, Separator(), Switch(), Tabs(), Tooltip(), TooltipContent(), TooltipProvider()

### Community 12 - "WebGL Shader Math"
Cohesion: 0.36
Nodes (5): fbm(), fract(), hash(), mix(), noise()

### Community 13 - "Layout & Navigation Shell"
Cohesion: 0.29
Nodes (5): AuthLayout(), Sidebar Component, DashboardLayout(), navItems, Sidebar()

### Community 14 - "Card UI Components"
Cohesion: 0.25
Nodes (7): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle()

### Community 15 - "Auth Middleware & E2E Tests"
Cohesion: 0.38
Nodes (5): AdminOS Landing Page snapshot, Row Level Security (Supabase), config, middleware(), updateSession()

### Community 16 - "Progress Indicator"
Cohesion: 0.47
Nodes (5): Progress(), ProgressIndicator(), ProgressLabel(), ProgressTrack(), ProgressValue()

### Community 17 - "Next.js Project Config"
Cohesion: 0.40
Nodes (4): ESLint Config, nextConfig, life-admin-app Package, PostCSS Tailwind Config

### Community 18 - "Tab Navigation Components"
Cohesion: 0.50
Nodes (4): TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 21 - "Landing Hero Image"
Cohesion: 1.00
Nodes (3): Dark Theme, Hero Section, Landing Page

## Knowledge Gaps
- **140 isolated node(s):** `allow`, `extends`, `$schema`, `style`, `rsc` (+135 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Shared Utilities & UI Primitives` to `Dashboard & KPI Widgets`, `CRUD Page Components`, `Dropdown Menu Components`, `Button & Dialog Primitives`, `Form Select & Toggle Primitives`, `Layout & Navigation Shell`, `Card UI Components`, `Progress Indicator`, `Tab Navigation Components`, `Text Input Primitives`, `Badge Component`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Why does `Supabase Client (browser)` connect `CRUD Mutation Handlers` to `Dashboard & KPI Widgets`, `CRUD Page Components`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `createClient()` connect `CRUD Page Components` to `CRUD Mutation Handlers`, `Layout & Navigation Shell`, `Auth Middleware & E2E Tests`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `cn()` (e.g. with `tsconfig path aliases (@/*)` and `TooltipProvider()`) actually correct?**
  _`cn()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `Supabase Client (browser)` (e.g. with `AppointmentsClient.handleDelete` and `AppointmentsClient.handleSubmit`) actually correct?**
  _`Supabase Client (browser)` has 16 INFERRED edges - model-reasoned connections that need verification._
- **What connects `allow`, `extends`, `$schema` to the rest of the system?**
  _141 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard & KPI Widgets` be split into smaller, more focused modules?**
  _Cohesion score 0.07184325108853411 - nodes in this community are weakly interconnected._