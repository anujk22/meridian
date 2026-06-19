export interface EvidenceChunk {
  id: string
  title: string
  publisher: string
  url: string
  published: string
  excerpt: string
  whyItMatters: string
  tags: string[]
  quantitative: boolean
}

export const EVIDENCE_CORPUS: EvidenceChunk[] = [
  {
    id: 'bls-software-outlook',
    title: 'Software Developers: Occupational Outlook',
    publisher: 'U.S. Bureau of Labor Statistics',
    url: 'https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm',
    published: '2025',
    excerpt: 'BLS reports a May 2024 median annual wage of $133,080 for software developers and projects 16% employment growth from 2024 to 2034.',
    whyItMatters: 'A stable software role has a meaningful, evidence-backed financial floor and durable labor demand.',
    tags: ['software', 'salary', 'employment', 'stability', 'career'],
    quantitative: true,
  },
  {
    id: 'bls-software-teamwork',
    title: 'Software Developer Work Environment',
    publisher: 'U.S. Bureau of Labor Statistics',
    url: 'https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm#tab-3',
    published: '2025',
    excerpt: 'BLS describes software development as a collaborative process and notes that developers commonly work in teams.',
    whyItMatters: 'Team structure can provide mentorship and career capital, but the actual role still needs to be verified.',
    tags: ['software', 'team', 'mentorship', 'career capital'],
    quantitative: false,
  },
  {
    id: 'bls-ai-demand',
    title: 'Software Employment Demand',
    publisher: 'U.S. Bureau of Labor Statistics',
    url: 'https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm#tab-6',
    published: '2025',
    excerpt: 'BLS links continued software demand partly to expansion in artificial intelligence, robotics, automation, and connected products.',
    whyItMatters: 'The job path can still compound AI-relevant career capital when the role offers genuine access to that work.',
    tags: ['AI', 'software', 'demand', 'career capital'],
    quantitative: false,
  },
  {
    id: 'sba-startup-survival',
    title: 'Frequently Asked Questions About Small Business',
    publisher: 'U.S. Small Business Administration Office of Advocacy',
    url: 'https://advocacy.sba.gov/wp-content/uploads/2023/03/Frequently-Asked-Questions-About-Small-Business-March-2023-508c.pdf',
    published: '2023',
    excerpt: 'Across 1994–2020 cohorts, SBA reports that 67.7% of new employer establishments survived two years and 48.9% survived five years.',
    whyItMatters: 'A startup path deserves a wider downside range. These establishment-level base rates are context, not a prediction for one company.',
    tags: ['startup', 'survival', 'base rate', 'risk', 'company'],
    quantitative: true,
  },
  {
    id: 'carta-equity-liquidity',
    title: 'Liquidity Events',
    publisher: 'Carta',
    url: 'https://carta.com/learn/equity/liquidity-events/',
    published: '2023',
    excerpt: 'Carta explains that private-company stock options are illiquid and may be difficult to convert to cash without an IPO, acquisition, or secondary transaction.',
    whyItMatters: 'Startup equity should not be scored as guaranteed cash compensation or a reliable financial floor.',
    tags: ['startup', 'equity', 'liquidity', 'options', 'cash', 'risk'],
    quantitative: false,
  },
  {
    id: 'carta-equity-exercise',
    title: 'Private Equity and Job Offers',
    publisher: 'Carta',
    url: 'https://carta.com/learn/equity/private-company-equity/',
    published: '2019',
    excerpt: 'Private-company option holders may need to pay an exercise cost and taxes before an uncertain future liquidity event.',
    whyItMatters: 'Headline grant value can overstate usable near-term compensation, especially for someone with limited savings.',
    tags: ['equity', 'exercise', 'tax', 'limited savings', 'compensation'],
    quantitative: false,
  },
  {
    id: 'nsf-graduate-support',
    title: 'Funding for Graduate Students',
    publisher: 'U.S. National Science Foundation',
    url: 'https://www.nsf.gov/funding/graduate-students',
    published: '2026',
    excerpt: 'NSF lists support for research-based STEM master’s and doctoral students through fellowships, project budgets, traineeships, stipends, and cost-of-education allowances.',
    whyItMatters: 'Verified funding can materially reduce the financial downside of a research path while preserving focused research time.',
    tags: ['graduate', 'research', 'masters', 'funding', 'stipend', 'tuition', 'AI'],
    quantitative: false,
  },
  {
    id: 'nsf-research-network',
    title: 'Graduate Research Opportunities',
    publisher: 'U.S. National Science Foundation',
    url: 'https://www.nsf.gov/funding/graduate-students',
    published: '2026',
    excerpt: 'NSF-supported research programs pair graduate training with mentoring, research projects, and professional-network development.',
    whyItMatters: 'Strong lab and advisor access can increase both technical depth and future research or industry options.',
    tags: ['research', 'mentorship', 'network', 'lab', 'career capital'],
    quantitative: false,
  },
  {
    id: 'education-opportunity-cost',
    title: 'How to Evaluate Financial Aid Offers',
    publisher: 'U.S. Department of Education, Federal Student Aid',
    url: 'https://studentaid.gov/articles/evaluating-financial-aid-offers/',
    published: '2026',
    excerpt: 'Federal Student Aid distinguishes grants, work-study, and loans, and notes that graduate students may use Direct PLUS loans for costs not covered by other aid.',
    whyItMatters: 'A program described as funded must be checked carefully: grants and stipends are not equivalent to debt or uncertain work-study income.',
    tags: ['graduate', 'funding', 'loans', 'work study', 'cost', 'financial aid'],
    quantitative: false,
  },
  {
    id: 'education-work-study',
    title: 'Federal Work-Study Facts',
    publisher: 'U.S. Department of Education, Federal Student Aid',
    url: 'https://studentaid.gov/articles/8-things-federal-work-study/',
    published: '2026',
    excerpt: 'Federal Work-Study positions are limited, generally part time, and require the student to secure and perform a job to receive earnings.',
    whyItMatters: 'Work-study should not be treated as guaranteed program funding when comparing financial floors.',
    tags: ['graduate', 'work study', 'funding', 'income', 'uncertainty'],
    quantitative: false,
  },
]

export const BUILTIN_RETRIEVAL_QUERIES = [
  'software engineering career stability salary outlook mentorship',
  'startup survival uncertainty early stage company risk',
  'funded research masters AI graduate support lab access stipend',
  'graduate school funding loans work study opportunity cost',
  'private startup equity liquidity risk options not cash',
  'research masters funded stipend tuition fellowship changes cost',
]
