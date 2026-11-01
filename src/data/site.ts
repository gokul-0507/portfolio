export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  isCurrent: boolean;
  workMode?: string;
  domain: string;
  focus?: string;
}

export interface ProjectItem {
  id: string;
  slug: string;
  index: string;
  category: string;
  title: string;
  status: string;
  statusType: 'in-progress' | 'proposal' | 'prototype';
  summary: string;
  topics: string[];
  repoUrl?: string;
  hasCaseStudy: boolean;
}

export interface SiteConfig {
  name: string;
  role: string;
  bio: string;
  college: string;
  degree: string;
  batch: string;
  email: string;
  github: string;
  linkedin: string;
  siteUrl: string;
  experience: ExperienceItem[];
  skills: {
    category: string;
    items: string[];
  }[];
  interests: string[];
  projects: ProjectItem[];
}

export const siteData: SiteConfig = {
  name: 'Gokul J',
  role: 'B.E. Computer Science and Design student',
  bio: 'Computer Science & Design undergraduate exploring AI, computer vision, and physical-digital systems.',
  college: 'SRM Easwari Engineering College',
  degree: 'B.E. Computer Science and Design',
  batch: '2025–2029',
  email: 'gokuljayakumar947@gmail.com',
  github: 'https://github.com/gokul-0507',
  linkedin: 'https://linkedin.com/in/gokul-j-48a026382',
  siteUrl: 'https://portfolio-omega-seven-09i8c1d9jj.vercel.app',
  experience: [
    {
      id: 'srm-research',
      role: 'Research Intern',
      company: 'SRM Group',
      location: 'Ramapuram, Chennai',
      period: 'Current',
      isCurrent: true,
      domain: 'Research & Learning',
      focus: 'Research-oriented work and technical learning.',
    },
    {
      id: 'corizo-ai',
      role: 'Artificial Intelligence Intern',
      company: 'Corizo Edutech',
      location: 'Remote',
      workMode: 'Remote',
      period: 'June 15, 2026 – September 15, 2026',
      isCurrent: false,
      domain: 'Artificial Intelligence',
    },
    {
      id: 'apex-web',
      role: 'Web Development Intern',
      company: 'Apex Skill Technologies Pvt. Ltd.',
      location: 'Online',
      workMode: 'Online',
      period: 'May 2026 – June 2026',
      isCurrent: false,
      domain: 'Web Development',
    },
  ],
  skills: [
    {
      category: 'Languages',
      items: ['Java', 'Python', 'SQL'],
    },
    {
      category: 'Foundations',
      items: ['Data Structures and Algorithms', 'Object-Oriented Programming'],
    },
  ],
  interests: ['Software Development', 'AI/ML', 'Computer Vision', 'Agentic AI'],
  projects: [
    {
      id: 'satquery-ai',
      slug: 'satquery-ai',
      index: '01',
      category: 'AI Assistant',
      title: 'SatQuery AI',
      status: 'In Progress',
      statusType: 'in-progress',
      summary:
        'An assistant that takes natural language questions, finds matching satellite imagery, and summarizes what is visible.',
      topics: ['Python', 'Computer Vision', 'Satellite Data', 'AI Agents'],
      // TODO(gokul): add GitHub repository URL for SatQuery AI if publicly available
      repoUrl: undefined,
      hasCaseStudy: true,
    },
    {
      id: 'echogrid',
      slug: 'echogrid',
      index: '02',
      category: 'Proposal',
      title: 'EchoGrid',
      status: 'Proposal',
      statusType: 'proposal',
      summary:
        'An engineering proposal for monitoring bridge and building health using passive vibration and acoustic sensors.',
      topics: ['Sensor Networks', 'Signal Processing', 'Structural Monitoring'],
      // TODO(gokul): add GitHub repository or proposal document URL for EchoGrid if available
      repoUrl: undefined,
      hasCaseStudy: true,
    },
  ],
};
