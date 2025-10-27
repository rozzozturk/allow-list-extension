"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WelcomeStep } from "./steps/welcome-step"
import { ConfigurationStep } from "./steps/configuration-step"
import { GuidanceStep } from "./steps/guidance-step"
import { CompletionStep } from "./steps/completion-step"
import { ProgressBar } from "./progress-bar"
import { StepIndicator } from "./step-indicator"

export type Language = "tr" | "en"

export interface WizardState {
  currentStep: number
  language: Language
  ipAddresses: string[]
  domains: string[]
  completedSteps: number[]
  screenshots: Array<{
    stepNumber: number
    stepName: string
    timestamp: string
    dataUrl: string
  }>
}

interface PanelPosition {
  x: number
  y: number
}


const TOTAL_STEPS = 8
const PANEL_SIZE = { width: 400, height: 600 }
const STORAGE_KEY = 'whitelist_wizard_position'

export function WhitelistWizard() {
  const [state, setState] = useState<WizardState>({
    currentStep: 0,
    language: "tr",
    ipAddresses: ["149.72.161.59", "149.72.42.201", "149.72.154.87"],
    domains: [],
    completedSteps: [],
    screenshots: [],
  })

  // Position state
  const [position, setPosition] = useState<PanelPosition>({ x: 20, y: 20 })
  
  const headerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  // Position management functions
  const savePosition = async (pos: PanelPosition) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos))
    } catch (error) {
      console.warn('Failed to save position:', error)
    }
  }

  const loadPosition = (): PanelPosition => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Failed to load position:', error)
    }
    return { x: 20, y: 20 }
  }

  // Load saved position on mount
  useEffect(() => {
    const savedPosition = loadPosition()
    setPosition(savedPosition)
  }, [])

  // Simple drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('button')) return
    
    const startX = e.clientX - position.x
    const startY = e.clientY - position.y
    
    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - startX
      const newY = e.clientY - startY
      
      const maxX = window.innerWidth - PANEL_SIZE.width
      const maxY = window.innerHeight - PANEL_SIZE.height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      savePosition(position)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const nextStep = () => {
    if (state.currentStep < TOTAL_STEPS) {
      setState((prev) => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        completedSteps: [...prev.completedSteps, prev.currentStep],
      }))
    }
  }

  const prevStep = () => {
    if (state.currentStep > 0) {
      setState((prev) => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }))
    }
  }

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <WelcomeStep state={state} updateState={updateState} nextStep={nextStep} />
      case 1:
        return <ConfigurationStep state={state} updateState={updateState} nextStep={nextStep} prevStep={prevStep} />
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        return <GuidanceStep state={state} updateState={updateState} nextStep={nextStep} prevStep={prevStep} />
      case 8:
        return <CompletionStep state={state} updateState={updateState} prevStep={prevStep} />
      default:
        return null
    }
  }

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed z-50 bg-card border border-border rounded-lg shadow-2xl"
      style={{
        left: position.x,
        top: position.y,
        width: PANEL_SIZE.width,
        height: PANEL_SIZE.height
      }}
    >
      {/* Draggable Header */}
      <motion.div
        ref={headerRef}
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm rounded-t-lg cursor-grab active:cursor-grabbing select-none"
        whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Keepnet Assistant</h1>
            <p className="text-xs text-muted-foreground">
              {state.language === "tr" ? "Office 365 Rehberi" : "Office 365 Guide"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateState({ language: state.language === "tr" ? "en" : "tr" })}
            className="px-3 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-xs font-medium"
          >
            {state.language === "tr" ? "🇬🇧" : "🇹🇷"}
          </button>
        </div>
      </motion.div>

      {/* Progress Section */}
      {state.currentStep > 0 && state.currentStep < TOTAL_STEPS && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-b border-border bg-card/30 backdrop-blur-sm"
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {state.language === "tr" ? "İlerleme" : "Progress"}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {state.language === "tr" ? "Adım" : "Step"} {state.currentStep}/{TOTAL_STEPS}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                  <StepIndicator
                    key={i}
                    stepNumber={i + 1}
                    isActive={state.currentStep === i + 1}
                    isComplete={state.completedSteps.includes(i + 1)}
                  />
                ))}
              </div>
            </div>
            <ProgressBar current={state.currentStep} total={TOTAL_STEPS} />
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
