"use client";

import { motion } from "framer-motion";

const phases = [
  {
    phase: "Q1/Q2 2025",
    title: "Foundation",
    items: [
      "Concept development & tokenomics design",
      "Smart contract development & audit",
      "Community building & social launch",
      "Website & presale platform development",
    ],
    completed: true,
  },
  {
    phase: "Q3 2025",
    title: "Presale Launch",
    items: [
      "Public presale launch",
      "Liquidity pool creation",
      "DEX listing (Uniswap)",
      "Initial marketing campaign",
    ],
    completed: false,
  },
  {
    phase: "Q4 2025",
    title: "Growth",
    items: [
      "CEX listing applications",
      "Community governance implementation",
      "Strategic partnerships",
      "Expanded marketing push",
    ],
    completed: false,
  },
  {
    phase: "2026",
    title: "Ecosystem Expansion",
    items: [
      "Cross-chain bridging",
      "DeFi product integrations",
      "DAO governance launch",
      "Ecosystem grant program",
    ],
    completed: false,
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Roadmap
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Our vision for building a sustainable and thriving ecosystem.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent hidden md:block" />

          <div className="space-y-12 md:space-y-16">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content card */}
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : ""}`}>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-3">
                      {phase.phase}
                    </div>
                    <h3 className={`text-xl font-bold text-white mb-4 ${phase.completed ? "line-through text-slate-500" : ""}`}>
                      {phase.title}
                    </h3>
                    <ul className="space-y-2">
                      {phase.items.map((item) => (
                        <li
                          key={item}
                          className="text-slate-400 flex items-start gap-2"
                        >
                          <span className="text-blue-400 mt-1 shrink-0">
                            {index % 2 === 0 ? "—" : "—"}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    {phase.completed && (
                      <div className="mt-4 inline-flex items-center gap-1 text-green-400 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Completed
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline dot */}
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-500 border-4 border-slate-900 z-10 hidden md:block" />

                {/* Spacer */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
