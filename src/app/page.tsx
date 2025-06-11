'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowRightIcon, Shield, Zap, Globe, DollarSign, TrendingUp, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CountUp } from '@/components/ui/count-up'
import { patentDataReader } from '@/data/patent-data'
import { PatentData } from '@/types/patent-types'

export default function HomePage() {
  const [selectedPatent, setSelectedPatent] = React.useState<PatentData | null>(null)
  const [portfolioData, setPortfolioData] = React.useState<any>(null)
  const [demoRequests, setDemoRequests] = React.useState(0)

  React.useEffect(() => {
    // Load AXIOM Genesis patent portfolio data only
    const portfolio = patentDataReader.getCompletePatentPortfolio()
    setPortfolioData(portfolio)

    // Log showcase activity (completely isolated from main business)
    patentDataReader.logShowcaseActivity('axiom_genesis_homepage_view', {
      timestamp: new Date().toISOString(),
      portfolioValue: '$164.5B',
      patentCount: 41
    })
  }, [])

  const handlePatentClick = (patent: PatentData) => {
    setSelectedPatent(patent)
    patentDataReader.logShowcaseActivity('patent_detailed_view', {
      patentId: patent.id,
      patentTitle: patent.title,
      marketValue: patent.marketValue,
      timestamp: new Date().toISOString()
    })
  }

  const handleExploreImplementation = (patentId: string) => {
    // Only link to GIU system (port 3000) when specifically exploring implementation
    window.open('http://localhost:3000', '_blank')
    patentDataReader.logShowcaseActivity('implementation_exploration', {
      patentId,
      redirectTarget: 'http://localhost:3000',
      timestamp: new Date().toISOString()
    })
  }

  const handleExecutiveDemo = () => {
    setDemoRequests(prev => prev + 1)
    patentDataReader.logShowcaseActivity('executive_demo_request', {
      timestamp: new Date().toISOString(),
      requestNumber: demoRequests + 1
    })
    // In production, this would trigger a booking system
    alert('Executive Demo Requested - Our team will contact you within 24 hours')
  }

  const handlePatentLicensing = () => {
    patentDataReader.logShowcaseActivity('patent_licensing_inquiry', {
      timestamp: new Date().toISOString(),
      portfolioValue: '$164.5B'
    })
    alert('Patent Licensing Inquiry Submitted - Legal team will respond within 48 hours')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-8">
            <span className="text-blue-500">AXIOM</span>
            <span className="text-purple-500"> Genesis</span>
          </h1>
          
          <p className="text-2xl text-slate-300 mb-8">
            $164.5B Patent Portfolio Showcase
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">41</div>
              <div className="text-slate-300">Patents</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">$164.5B</div>
              <div className="text-slate-300">Portfolio Value</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-500 mb-2">$5.15B</div>
              <div className="text-slate-300">Annual Licensing</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">20</div>
              <div className="text-slate-300">Years Protection</div>
            </div>
          </div>
          
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold mr-4"
            onClick={() => alert('Executive Demo Requested')}
          >
            Executive Demo
          </button>
          
          <button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold"
            onClick={() => window.open('http://localhost:3000', '_blank')}
          >
            Explore Implementation
          </button>
        </div>
      </div>
    </div>
  )
} 