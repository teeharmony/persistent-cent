"use client";

import { motion } from "framer-motion";

const allocations = [
  { label: "Presale", percentage: 30, amount: "30B", color: "bg-blue-500" },
  { label: "Liquidity", percentage: 20, amount: "20B", color: "bg-purple-500" },
  { label: "Ecosystem", percentage: 20, amount: "20B", color: "bg-emerald-500" },
  { label: "Team (Vested)", percentage: 15, amount: "15B", color: "bg-amber-500" },
  { label: "Marketing", percentage: 15, amount: "15B", color: "bg-rose-500" },
];

export default function Tokenomics() {
  return (
    <section id="tokenomics" className="py-24 px-6 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Tokenomics
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            A carefully balanced distribution designed for long-term sustainability
            and community growth.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Distribution chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Visual pie chart representation */}
            <div className="relative w-72 h-72 mx-auto">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {allocations.map((item, i) => {
                  const offset = allocations
                    .slice(0, i)
                    .reduce((sum, a) => sum + (a.percentage / 100) * 360, 0);
                  const length = (item.percentage / 100) * 360;
                  const colors = [
                    "#3b82f6",
                    "#a855f7",
                    "#10b981",
                    "#f59e0b",
                    "#f43f5e",
                  ];
                  return (
                    <circle
                      key={item.label}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={colors[i]}
                      strokeWidth="12"
                      strokeDasharray={`${length} 360`}
                      strokeDashoffset={-offset}
                      className="transition-all duration-1000"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">100B</div>
                  <div className="text-sm text-slate-400">Total Supply</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Allocation list */}
          <div className="space-y-4">
            {allocations.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className={`w-4 h-4 rounded-full ${item.color}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-medium">{item.label}</span>
                    <span className="text-slate-400 text-sm">
                      {item.percentage}% ({item.amount})
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
