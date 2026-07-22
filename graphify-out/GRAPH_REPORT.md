# Graph Report - .  (2026-07-21)

## Corpus Check
- Corpus is ~22,309 words - fits in a single context window. You may not need a graph.

## Summary
- 241 nodes · 453 edges · 18 communities (17 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Feature Pages & Shared Utils|Feature Pages & Shared Utils]]
- [[_COMMUNITY_App Routes & Server Layer|App Routes & Server Layer]]
- [[_COMMUNITY_Form UI Primitives|Form UI Primitives]]
- [[_COMMUNITY_Dashboard Client & Data Types|Dashboard Client & Data Types]]
- [[_COMMUNITY_App Shell & Animation Providers|App Shell & Animation Providers]]
- [[_COMMUNITY_Dropdown Menu Component|Dropdown Menu Component]]
- [[_COMMUNITY_Badge, Tooltip & Format Utils|Badge, Tooltip & Format Utils]]
- [[_COMMUNITY_Button & Dialog Components|Button & Dialog Components]]
- [[_COMMUNITY_Hero Shader Scene (WebGL Noise)|Hero Shader Scene (WebGL Noise)]]
- [[_COMMUNITY_Card Component|Card Component]]
- [[_COMMUNITY_Avatar Component|Avatar Component]]
- [[_COMMUNITY_Landing Page & Hero Canvas|Landing Page & Hero Canvas]]
- [[_COMMUNITY_Progress Component|Progress Component]]
- [[_COMMUNITY_Tabs Component|Tabs Component]]
- [[_COMMUNITY_Auth Middleware & Session|Auth Middleware & Session]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 77 edges
2. `staggerContainer()` - 13 edges
3. `createClient()` - 12 edges
4. `createClient()` - 12 edges
5. `formatDate()` - 8 edges
6. `fadeUp` - 7 edges
7. `spring` - 6 edges
8. `getDaysUntil()` - 6 edges
9. `formatCurrency()` - 5 edges
10. `getUrgencyColor()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Avatar()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts
- `AvatarImage()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts
- `AvatarFallback()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts
- `AvatarBadge()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts
- `AvatarGroup()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/avatar.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (18 total, 1 thin omitted)

### Community 0 - "Feature Pages & Shared Utils"
Cohesion: 0.07
Nodes (38): Props, BillsClient(), CATEGORIES, Props, CATEGORIES, DeadlinesClient(), PRIORITIES, Props (+30 more)

### Community 1 - "App Routes & Server Layer"
Cohesion: 0.10
Nodes (9): PageTransition(), AppointmentsClient(), genAI, navItems, Sidebar(), Props, SettingsClient(), createClient() (+1 more)

### Community 2 - "Form UI Primitives"
Cohesion: 0.16
Nodes (15): cn(), Input(), Label(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectScrollDownButton() (+7 more)

### Community 3 - "Dashboard Client & Data Types"
Cohesion: 0.14
Nodes (11): DashboardClient(), GlassOrb, Props, staggerItem(), getGreeting(), getPriorityBadge(), Bill, Deadline (+3 more)

### Community 4 - "App Shell & Animation Providers"
Cohesion: 0.16
Nodes (9): CustomCursor(), LenisContext, LenisProvider(), Preloader(), dmSans, jetbrainsMono, metadata, syne (+1 more)

### Community 5 - "Dropdown Menu Component"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 6 - "Badge, Tooltip & Format Utils"
Cohesion: 0.14
Nodes (3): Badge(), badgeVariants, TooltipContent()

### Community 7 - "Button & Dialog Components"
Cohesion: 0.16
Nodes (8): Button(), buttonVariants, DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle()

### Community 8 - "Hero Shader Scene (WebGL Noise)"
Cohesion: 0.36
Nodes (5): fbm(), fract(), hash(), mix(), noise()

### Community 9 - "Card Component"
Cohesion: 0.25
Nodes (7): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle()

### Community 10 - "Avatar Component"
Cohesion: 0.29
Nodes (6): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage()

### Community 12 - "Progress Component"
Cohesion: 0.33
Nodes (5): Progress(), ProgressIndicator(), ProgressLabel(), ProgressTrack(), ProgressValue()

### Community 13 - "Tabs Component"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 14 - "Auth Middleware & Session"
Cohesion: 0.60
Nodes (3): config, middleware(), updateSession()

## Knowledge Gaps
- **32 isolated node(s):** `Props`, `CATEGORIES`, `Props`, `GlassOrb`, `Props` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Form UI Primitives` to `Feature Pages & Shared Utils`, `App Routes & Server Layer`, `Dropdown Menu Component`, `Badge, Tooltip & Format Utils`, `Button & Dialog Components`, `Card Component`, `Avatar Component`, `Progress Component`, `Tabs Component`?**
  _High betweenness centrality (0.338) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Feature Pages & Shared Utils` to `App Routes & Server Layer`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `createClient()` connect `App Routes & Server Layer` to `Feature Pages & Shared Utils`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `Props`, `CATEGORIES`, `Props` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Feature Pages & Shared Utils` be split into smaller, more focused modules?**
  _Cohesion score 0.06715063520871144 - nodes in this community are weakly interconnected._
- **Should `App Routes & Server Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.0960591133004926 - nodes in this community are weakly interconnected._
- **Should `Dashboard Client & Data Types` be split into smaller, more focused modules?**
  _Cohesion score 0.14035087719298245 - nodes in this community are weakly interconnected._