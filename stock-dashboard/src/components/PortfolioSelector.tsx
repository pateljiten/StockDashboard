'use client'

import { PortfolioView } from '@/types/portfolio'

type PortfolioSelectorProps = {
  currentView: PortfolioView
  onViewChange: (view: PortfolioView) => void
}

type TabButtonProps = {
  label: string
  isActive: boolean
  onClick: () => void
}

const TabButton = ({ label, isActive, onClick }: TabButtonProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`relative px-6 py-3 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'text-emerald-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
      role="tab"
      aria-selected={isActive}
      tabIndex={0}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-600" />
      )}
    </button>
  )
}

const PortfolioSelector = ({ currentView, onViewChange }: PortfolioSelectorProps) => {
  return (
    <div className="flex items-center rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex" role="tablist" aria-label="Portfolio views">
        <TabButton
          label="Consolidated"
          isActive={currentView === 'consolidated'}
          onClick={() => onViewChange('consolidated')}
        />
        <div className="my-2 w-px bg-gray-200" />
        <TabButton
          label="Jiten"
          isActive={currentView === 'portfolio1'}
          onClick={() => onViewChange('portfolio1')}
        />
        <div className="my-2 w-px bg-gray-200" />
        <TabButton
          label="Khushboo"
          isActive={currentView === 'portfolio2'}
          onClick={() => onViewChange('portfolio2')}
        />
      </div>
    </div>
  )
}

export default PortfolioSelector

