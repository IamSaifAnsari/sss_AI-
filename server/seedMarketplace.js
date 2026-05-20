import { db, uuid } from './db.js';

const ITEMS = [
  {
    slug: 'sales-outreach-pack', name: 'Sales Outreach Agent', category: 'agents',
    description: 'Automated lead qualification and personalized outreach', rating: 4.7,
    tags: ['Sales', 'Email', 'CRM'],
    template: {
      agents: [
        { name: 'Sales Outreach Bot', description: 'Qualifies inbound leads and drafts personalized emails', model: 'gpt-4o',
          system_prompt: 'You are a friendly B2B sales assistant. Qualify leads on company size, budget, and timeline. Draft concise, personalized outreach emails.',
          tools: ['crm', 'email', 'calendar'] },
      ],
      workflows: [
        { name: 'Lead Qualification → Email', trigger: 'Webhook' },
      ],
    },
  },
  {
    slug: 'support-suite', name: 'Customer Support Suite', category: 'agents',
    description: 'Multi-channel AI support with knowledge base integration', rating: 4.9,
    tags: ['Support', 'Tickets', 'Chat'],
    template: {
      agents: [
        { name: 'Support Front Door', description: 'First-line support agent with KB access', model: 'claude-3.5',
          system_prompt: 'You are a helpful customer support agent. Search the knowledge base first. Escalate to a human if confidence is low.',
          tools: ['knowledge', 'slack'] },
        { name: 'Support Escalation', description: 'Handles complex tickets that need human + AI collaboration', model: 'gpt-4o',
          system_prompt: 'You are a senior support engineer. Summarize the ticket and propose next steps for the human agent.',
          tools: ['knowledge'] },
      ],
      workflows: [
        { name: 'Ticket Routing', trigger: 'Email' },
      ],
    },
  },
  {
    slug: 'recruiter-pack', name: 'Recruitment AI Pack', category: 'industry',
    description: 'Complete AI hiring pipeline with resume screening and outreach', rating: 4.8,
    tags: ['Hiring', 'Resume', 'ATS'],
    template: {
      agents: [
        { name: 'Resume Screener', description: 'Scores resumes against job description', model: 'gpt-4o',
          system_prompt: 'Score the resume 0-100 for fit against the job description. Surface 3 strengths and 3 concerns.',
          tools: ['knowledge'] },
        { name: 'Candidate Outreach', description: 'Drafts personalized cold messages to candidates', model: 'claude-3.5',
          system_prompt: 'Draft warm, specific outreach messages referencing the candidate\'s actual experience.', tools: ['email'] },
      ],
      workflows: [
        { name: 'Resume → Score → Outreach', trigger: 'Webhook' },
      ],
    },
  },
  {
    slug: 'content-pipeline', name: 'Content Calendar Workflow', category: 'workflows',
    description: 'AI-powered content planning and publishing pipeline', rating: 4.5,
    tags: ['Content', 'Social', 'Schedule'],
    template: {
      agents: [
        { name: 'Content Writer', description: 'Drafts blog posts and social copy', model: 'claude-3.5',
          system_prompt: 'Write in a clear, engaging voice. Vary sentence length. Avoid clichés and filler.', tools: ['search'] },
      ],
      workflows: [
        { name: 'Draft → Review → Publish', trigger: 'Schedule' },
      ],
    },
  },
  {
    slug: 'voice-receptionist', name: 'Voice Receptionist', category: 'voice',
    description: '24/7 AI phone receptionist with appointment booking', rating: 4.8,
    tags: ['Phone', 'Scheduling', 'IVR'],
    template: {
      agents: [
        { name: 'Voice Receptionist', description: 'Answers calls, books appointments, takes messages', model: 'gpt-4o',
          system_prompt: 'You are the front-desk receptionist. Be warm, brief, and helpful. Confirm details before booking.',
          tools: ['calendar', 'email'] },
      ],
      workflows: [],
    },
  },
  {
    slug: 'ecommerce-assistant', name: 'E-commerce Assistant', category: 'agents',
    description: 'Product recommendations and order management', rating: 4.6,
    tags: ['Shopping', 'Recommendations'],
    template: {
      agents: [
        { name: 'Product Concierge', description: 'Helps shoppers find the right product', model: 'claude-3.5',
          system_prompt: 'You are a friendly shopping assistant. Ask 1-2 clarifying questions then recommend the top 3 products with reasoning.',
          tools: ['sql', 'search'] },
      ],
      workflows: [],
    },
  },
];

export function seedMarketplaceCatalog() {
  const existing = db.prepare('SELECT COUNT(*) AS n FROM marketplace_items').get();
  if (existing.n > 0) return;
  const insert = db.prepare(
    'INSERT INTO marketplace_items (id, slug, name, category, description, tags, rating, template) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const tx = db.transaction(() => {
    for (const it of ITEMS) {
      insert.run(uuid(), it.slug, it.name, it.category, it.description, JSON.stringify(it.tags), it.rating, JSON.stringify(it.template));
    }
  });
  tx();
  console.log(`[seed] Marketplace: ${ITEMS.length} items`);
}
