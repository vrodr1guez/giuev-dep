// AXIOM Genesis Patent Portfolio Types - Pure Showcase Data

export interface PatentData {
  id: string
  title: string
  description: string
  marketValue: number // in billions
  roi: string
  status: 'Active Protection' | 'Filed' | 'Pending' | 'Granted'
  filingDate: string
  categories: string[]
}

export interface PatentCategory {
  count: number
  marketValue: string
  annualLicensing: string
  patents: PatentData[]
}

export interface PatentPortfolioMetadata {
  totalPatents: number
  portfolioValue: number // in billions
  annualLicensing: number // in billions
  marketProtection: number // in billions
  lastUpdated: string
  coveragePercentage: number
  gapAreas: string
}

export interface PatentPortfolio {
  metadata: PatentPortfolioMetadata
  existing28Patents: {
    federatedLearning: PatentCategory
    digitalTwin: PatentCategory
    performanceOptimization: PatentCategory
  }
  additional13Patents: {
    quantumTechnologies: PatentCategory
    cybersecurityInnovations: PatentCategory
    mobileUITechnologies: PatentCategory
  }
  businessMetrics: {
    marketCoverage: string
    competitiveBarrier: string
    technologyLeadership: string
    globalMarketControl: string
    patentStrength: string
    industryPosition: string
  }
}

export interface ShowcaseActivity {
  timestamp: string
  activity: string
  details: any
  userType: 'investor' | 'attorney' | 'partner' | 'executive' | 'demo'
  sessionId: string
}

export interface AxiomFoundation {
  id: string
  name: string
  description: string
  patentCount: number
  marketValue: string
  keyTechnologies: string[]
  competitive: string
  implementation: string[]
}

export interface ROICalculation {
  patentId: string
  marketSize: number
  marketShare: number
  annualRevenue: number
  licensingPotential: number
  competitiveAdvantage: string
  riskFactors: string[]
  timeToMarket: string
}

export interface LegalDocumentation {
  patentId: string
  legalStatus: string
  filingJurisdictions: string[]
  examinerNotes: string
  priorArt: string[]
  claimsCount: number
  enforceability: 'Strong' | 'Medium' | 'Reviewing'
} 