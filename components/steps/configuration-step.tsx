"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Server, Globe, Copy, Check, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react"
import { KEEP_NET_DOMAINS } from "@/lib/constants"
import type { WizardState } from "../allow-list-wizard"

interface ConfigurationStepProps {
  state: WizardState
  updateState: (updates: Partial<WizardState>) => void
  nextStep: () => void
  prevStep: () => void
}

export function ConfigurationStep({ state, updateState, nextStep, prevStep }: ConfigurationStepProps) {
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null)

  const content = {
    tr: {
      title: "IP Adresleri ve Domain Yapılandırması",
      subtitle: "Keepnet için gerekli bilgileri girin",
      ipTitle: "Keepnet IP Adresleri",
      ipDescription: "Bu IP adresleri otomatik olarak eklenmiştir",
      domainTitle: "Domain Listesi",
      domainDescription: "Bu domainleri doğrudan kopyalayabilirsiniz",
      nextButton: "Devam Et",
      prevButton: "Geri",
      note: "Not: Bu bilgiler tüm yapılandırma adımlarında kullanılacaktır",
      copyLabel: "Kopyala",
      copiedLabel: "Kopyalandı",
      copyAllLabel: "Tümünü kopyala",
      domainCountLabel: "Domain Listesi",
    },
    en: {
      title: "IP Addresses and Domain Configuration",
      subtitle: "Enter required information for Keepnet",
      ipTitle: "Keepnet IP Addresses",
      ipDescription: "These IP addresses are automatically added",
      domainTitle: "Domain List",
      domainDescription: "You can copy these domains directly",
      nextButton: "Continue",
      prevButton: "Back",
      note: "Note: This information will be used in all configuration steps",
      copyLabel: "Copy",
      copiedLabel: "Copied",
      copyAllLabel: "Copy all",
      domainCountLabel: "Domain List",
    },
  }

  const t = content[state.language]

  const domainList = useMemo(() => (state.domains.length ? state.domains : [...KEEP_NET_DOMAINS]), [state.domains])

  useEffect(() => {
    if (state.domains.length === 0) {
      updateState({ domains: [...KEEP_NET_DOMAINS] })
    }
  }, [state.domains.length, updateState])

  const copyToClipboard = async (value: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = value
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }
      setCopiedDomain(value)
      setTimeout(() => setCopiedDomain((prev) => (prev === value ? null : prev)), 1800)
    } catch {
      setCopiedDomain(null)
    }
  }

  const handleNext = () => {
    nextStep()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-foreground mb-3 text-balance">{t.title}</h2>
        <p className="text-lg text-muted-foreground text-pretty">{t.subtitle}</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* IP Addresses */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card-elevated"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t.ipTitle}</h3>
              <p className="text-sm text-muted-foreground">{t.ipDescription}</p>
            </div>
          </div>
          <div className="space-y-2">
            {state.ipAddresses.map((ip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
              >
                <div className="w-2 h-2 bg-success rounded-full" />
                <code className="text-sm font-mono text-foreground flex-1">{ip}</code>
                <span className="badge-success">Aktif</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Domains */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card-elevated bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-white shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800 border border-slate-700 shadow-inner">
              <Globe className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{t.domainTitle}</h3>
              <p className="text-sm text-slate-300">{t.domainDescription}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-indigo-200">
              {t.domainCountLabel} ({domainList.length} {state.language === "tr" ? "domain" : "domains"})
            </div>
            <button
              onClick={() => copyToClipboard(domainList.join("\n"))}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30 border border-indigo-400/50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {t.copyAllLabel}
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {domainList.map((domain, index) => (
              <motion.div
                key={domain}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 + index * 0.01 }}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-800/80 border border-slate-700"
              >
                <code className="text-sm font-mono text-slate-100 flex-1">{domain}</code>
                <button
                  onClick={() => copyToClipboard(domain)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-500/15 text-indigo-100 hover:bg-indigo-500/25 border border-indigo-400/40 transition-colors"
                >
                  {copiedDomain === domain ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t.copiedLabel}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t.copyLabel}
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex items-start gap-3 p-4 rounded-lg bg-info/10 border border-info/30 mb-8"
      >
        <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <p className="text-sm text-info">{t.note}</p>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex items-center justify-between"
      >
        <button onClick={prevStep} className="btn-secondary inline-flex items-center gap-2 group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          {t.prevButton}
        </button>
        <button onClick={handleNext} className="btn-primary inline-flex items-center gap-2 group">
          {t.nextButton}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  )
}
