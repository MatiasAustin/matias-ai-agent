import { ActivityItem, ApprovalItem, Client, Project, Task, AgentInfo, MemoryCategory } from '../types';

export const initialClients: Client[] = [
  {
    id: 'xyz-ai',
    name: 'XYZ AI',
    industry: 'Autonomous Systems & Robotics',
    currentProject: 'Brand OS & Generative UI System',
    status: 'Active',
    lastActivity: '4 mins ago',
    aiMemoryStatus: 'Synced',
    metrics: {
      activeDeliverables: 5,
      memoryNodes: 142,
      studioHoursSaved: '38h'
    },
    brandPersonality: ['Minimal', 'Technical', 'Premium', 'Confident'],
    communicationStyle: ['Concise', 'Direct', 'Professional', 'Unapologetic clarity'],
    visualLanguage: ['Dark backgrounds', 'Large typography', 'High contrast', 'Minimal decoration'],
    recentWorkspaces: ['Token Architecture v2', 'Figma Design Tokens', 'Motion Choreography']
  },
  {
    id: 'monolith-corp',
    name: 'Monolith Architectural',
    industry: 'Spatial Architecture & Materials',
    currentProject: 'Spatial Portfolio & Physical AI Interaction',
    status: 'Active',
    lastActivity: '22 mins ago',
    aiMemoryStatus: 'Synced',
    metrics: {
      activeDeliverables: 3,
      memoryNodes: 96,
      studioHoursSaved: '24h'
    },
    brandPersonality: ['Monolithic', 'Sensory', 'Tactile', 'Timeless'],
    communicationStyle: ['Quietly Authoritative', 'Understated', 'Precise'],
    visualLanguage: ['Neutral Warm Gray', 'Brutal Elegance', 'Uncoated Paper Aesthetics'],
    recentWorkspaces: ['Material Archive 2026', 'Spatial Sound Identity']
  },
  {
    id: 'arc-audio',
    name: 'Arc Audio Systems',
    industry: 'Audiophile Acoustic Hardware',
    currentProject: 'Haptic Companion App Experience',
    status: 'Review',
    lastActivity: '1 hour ago',
    aiMemoryStatus: 'Up to date',
    metrics: {
      activeDeliverables: 2,
      memoryNodes: 64,
      studioHoursSaved: '19h'
    },
    brandPersonality: ['Acoustic', 'Precision Engineered', 'Warm Black'],
    communicationStyle: ['Musical', 'Ergonomic', 'Refined'],
    visualLanguage: ['Vibrational Waves', 'Soft Aluminum Reflections', 'Mono Spacing'],
    recentWorkspaces: ['DSP Interface Spec', 'Rotary Knob Dynamics']
  },
  {
    id: 'celoxis-labs',
    name: 'Celoxis Bio',
    industry: 'Synthetic Biology & Therapeutics',
    currentProject: 'Executive Identity & Scientific Visualization',
    status: 'Onboarding',
    lastActivity: '3 hours ago',
    aiMemoryStatus: 'Indexing',
    metrics: {
      activeDeliverables: 4,
      memoryNodes: 51,
      studioHoursSaved: '12h'
    },
    brandPersonality: ['Cellular', 'Luminous', 'Rigorous', 'Pioneering'],
    communicationStyle: ['Scientific Peer-Level', 'Optimistic', 'Clarity-Driven'],
    visualLanguage: ['Soft Translucent Layers', 'Microscopic Photography', 'Geist Font System'],
    recentWorkspaces: ['Clinical Whitepaper UI', 'Protein Folding Motion']
  }
];

export const initialApprovals: ApprovalItem[] = [
  {
    id: 'app-1',
    title: 'AI wants to send this message to John.',
    proposedAction: 'Send Slack message to #xyz-core-partners',
    client: 'XYZ AI',
    project: 'Brand OS & Generative UI System',
    reason: 'The client requested an update on the campaign deliverable and interactive prototype status.',
    previewContent: `"Hey John, the revised high-contrast visual tokens and spatial layout cards are now compiled into the Figma master library. All 6 motion presets are calibrated. We're ready for your team review whenever suits today."`,
    confidence: 96,
    time: '2 mins ago',
    status: 'pending'
  },
  {
    id: 'app-2',
    title: 'AI proposes merging design token repository.',
    proposedAction: 'Publish Design System Tokens v2.4 to Production CDN',
    client: 'Monolith Architectural',
    project: 'Spatial Portfolio & Physical AI Interaction',
    reason: 'Resolved contrast ratios across light and dark surfaces to meet studio WCAG AAA compliance standard.',
    previewContent: `Exported 42 semantic color variables and typography scale (Inter Display 48px, 32px, 20px, 14px) with zero breaking changes.`,
    confidence: 99,
    time: '18 mins ago',
    status: 'pending'
  }
];

export const initialActivities: ActivityItem[] = [
  {
    id: 'act-1',
    time: '09:51',
    agent: 'Creative Director Agent',
    action: 'Draft ready for review',
    client: 'XYZ AI',
    detail: 'Compiled 4 spatial view compositions with high-contrast editorial hierarchy.',
    badge: 'Deliverable',
    type: 'design'
  },
  {
    id: 'act-2',
    time: '09:46',
    agent: 'Design Agent',
    action: 'Opened Figma reference & synchronized vector layout',
    client: 'XYZ AI',
    detail: 'Imported artboard "Operating Canvas — 01" to vector canvas pipeline.',
    badge: 'Figma Sync',
    type: 'design'
  },
  {
    id: 'act-3',
    time: '09:45',
    agent: 'Design Agent',
    action: 'Found 3 approved reference designs',
    client: 'XYZ AI',
    detail: 'Extracted spatial card proportions (border-radius 24px, subtle border #E5E5E1).',
    badge: 'Design System',
    type: 'design'
  },
  {
    id: 'act-4',
    time: '09:44',
    agent: 'Memory Engine',
    action: 'Loaded brand memory',
    client: 'XYZ AI',
    detail: 'Retrieved 8 core guidelines: Minimal, Technical, High Contrast, Black Accents.',
    badge: 'Knowledge Graph',
    type: 'memory'
  },
  {
    id: 'act-5',
    time: '09:43',
    agent: 'Memory Engine',
    action: 'Loaded 8 relevant client memories',
    client: 'XYZ AI',
    detail: 'Indexed past creative directions, client tone feedback and Slack logs.',
    badge: 'Retrieval',
    type: 'memory'
  },
  {
    id: 'act-6',
    time: '09:42',
    agent: 'Research Agent',
    action: 'Read XYZ AI brief & opened Trello project "AI Feature Launch"',
    client: 'XYZ AI',
    detail: 'Parsed 3 deliverables and identified approval bottlenecks.',
    badge: 'Trello / Brief',
    type: 'research'
  },
  {
    id: 'act-7',
    time: '09:15',
    agent: 'Client Liaison Agent',
    action: 'Parsed incoming email feedback from Arc Audio lead engineer',
    client: 'Arc Audio Systems',
    detail: 'Tagged hardware enclosure tolerances for acoustic software team.',
    badge: 'Inbound Mail',
    type: 'comms'
  }
];

export const initialProjects: Project[] = [
  {
    id: 'p-1',
    title: 'Brand OS & Generative UI System',
    client: 'XYZ AI',
    status: 'In Progress',
    deadline: 'Tomorrow, 17:00',
    currentTask: 'Synthesizing editorial layouts and dark contrast cards',
    recentActivity: 'Draft ready for review',
    progress: 74,
    assignedAgents: ['Creative Director', 'Design Agent', 'Memory Engine']
  },
  {
    id: 'p-2',
    title: 'Spatial Portfolio & Physical AI Interaction',
    client: 'Monolith Architectural',
    status: 'In Progress',
    deadline: 'Oct 14, 2026',
    currentTask: 'Extracting tactile stone texture parameters into 3D shaders',
    recentActivity: '3D shader parameters normalized',
    progress: 58,
    assignedAgents: ['Spatial Agent', 'Research Agent']
  },
  {
    id: 'p-3',
    title: 'Haptic Companion App Experience',
    client: 'Arc Audio Systems',
    status: 'Client Review',
    deadline: 'Oct 18, 2026',
    currentTask: 'Awaiting feedback on rotary vibration curves',
    recentActivity: 'Audio telemetry model exported',
    progress: 90,
    assignedAgents: ['Sound Agent', 'Client Liaison']
  },
  {
    id: 'p-4',
    title: 'Synthetic Biology Executive Identity',
    client: 'Celoxis Bio',
    status: 'Discovery',
    deadline: 'Oct 28, 2026',
    currentTask: 'Formulating scientific nomenclature and typographic scale',
    recentActivity: 'Indexed 44 research papers',
    progress: 25,
    assignedAgents: ['Research Agent', 'Brand Intelligence']
  }
];

export const initialTasks: Task[] = [
  {
    id: 't-1',
    title: 'Generate High-Contrast Spatial Card Variations',
    client: 'XYZ AI',
    project: 'Brand OS & Generative UI System',
    agent: 'Design Agent',
    status: 'Running',
    priority: 'Urgent',
    deadline: 'Today, 14:00'
  },
  {
    id: 't-2',
    title: 'Cross-reference Client Tone with Q3 Press Release',
    client: 'XYZ AI',
    project: 'Brand OS & Generative UI System',
    agent: 'Brand Intelligence',
    status: 'Running',
    priority: 'High',
    deadline: 'Today, 16:30'
  },
  {
    id: 't-3',
    title: 'Review Slack Campaign Update Draft',
    client: 'XYZ AI',
    project: 'Brand OS & Generative UI System',
    agent: 'Client Liaison',
    status: 'Awaiting Feedback',
    priority: 'Urgent',
    deadline: 'Today, 11:00'
  },
  {
    id: 't-4',
    title: 'Vectorize Monolith Architectural Glyph System',
    client: 'Monolith Architectural',
    project: 'Spatial Portfolio',
    agent: 'Design Agent',
    status: 'Queued',
    priority: 'Normal',
    deadline: 'Tomorrow, 10:00'
  },
  {
    id: 't-5',
    title: 'Audit Audio Compression Telemetry v1.1',
    client: 'Arc Audio Systems',
    project: 'Haptic Companion App',
    agent: 'Research Agent',
    status: 'Done',
    priority: 'Normal',
    deadline: 'Yesterday'
  }
];

export const initialAgents: AgentInfo[] = [
  {
    id: 'ag-cd',
    name: 'Creative Director Agent',
    role: 'Art Direction, Taste Evaluation & Synthesis',
    status: 'Active',
    currentAction: 'Composing editorial hierarchy & card proportions for XYZ AI',
    memoryLoaded: '142 nodes',
    efficiency: '99.4%'
  },
  {
    id: 'ag-design',
    name: 'Design Automation Agent',
    role: 'Figma Token Sync, Layout Spatialization & UI Spec',
    status: 'Active',
    currentAction: 'Exporting 24px rounded card components with subtle borders',
    memoryLoaded: '96 nodes',
    efficiency: '98.1%'
  },
  {
    id: 'ag-mem',
    name: 'Memory Intelligence Engine',
    role: 'Knowledge Retrieval, Brand DNA & Client Habits',
    status: 'Active',
    currentAction: 'Synthesizing persistent client memories across 4 accounts',
    memoryLoaded: '353 nodes',
    efficiency: '100%'
  },
  {
    id: 'ag-liaison',
    name: 'Client Liaison Agent',
    role: 'Communications, Slack / Email Drafting, Approval Queue',
    status: 'Standby',
    currentAction: 'Waiting for Matias approval on Slack dispatch',
    memoryLoaded: '84 nodes',
    efficiency: '97.8%'
  },
  {
    id: 'ag-research',
    name: 'Research & Discovery Agent',
    role: 'Brief Deconstruction, Market Mapping, Technical Papers',
    status: 'Active',
    currentAction: 'Scanning competitive spatial interfaces and typography benchmarks',
    memoryLoaded: '110 nodes',
    efficiency: '99.0%'
  }
];

export const initialMemoryCategories: MemoryCategory[] = [
  {
    id: 'mem-xyz',
    client: 'XYZ AI',
    category: 'Core Brand DNA',
    items: [
      {
        label: 'Brand Personality',
        values: ['Minimal', 'Technical', 'Premium', 'Confident'],
        confidence: 99,
        source: 'Executive Strategy Workshop 2026'
      },
      {
        label: 'Communication',
        values: ['Concise', 'Direct', 'Professional', 'No Buzzwords'],
        confidence: 98,
        source: 'Slack Founder Interactions (84 messages)'
      },
      {
        label: 'Visual Language',
        values: ['Dark backgrounds', 'Large typography', 'High contrast', 'Minimal decoration'],
        confidence: 100,
        source: 'Approved Master Design Tokens v2.3'
      },
      {
        label: 'Typography Hierarchy',
        values: ['Inter Display for editorial headers', 'Sentence case only', 'Never all-caps for body'],
        confidence: 96,
        source: 'Creative Director Guideline Document'
      }
    ]
  },
  {
    id: 'mem-monolith',
    client: 'Monolith Architectural',
    category: 'Spatial Identity Rules',
    items: [
      {
        label: 'Material Expression',
        values: ['Warm neutral stone', 'Cast concrete tones', 'Deep charcoal accents'],
        confidence: 95,
        source: 'Architectural Spec Book #04'
      },
      {
        label: 'Interaction Tone',
        values: ['Quiet', 'Deliberate', 'Unrushed cadence'],
        confidence: 94,
        source: 'Client Lead Interview'
      }
    ]
  }
];
