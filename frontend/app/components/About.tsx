"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Community First",
    description:
      "Built by the community, for the community. Every decision is made with transparency and fairness at its core.",
    icon: "👥",
  },
  {
    title: "Locked Liquidity",
    description:
      "Liquidity tokens are locked for maximum security, preventing rug pulls and ensuring long-term stability for all holders.",
    icon: "🔒",
  },
  {
    title: "Fair Launch",
    description:
      "No VCs, no insiders, no special allocations. Everyone participates on equal terms from day one.",
    icon: "⚖️",
  },
  {
    title: "Transparent",
    description:
      "All smart contracts are verified, audited, and open source. No hidden functions, no backdoors — complete transparency.",
    icon: "📜",
  },
];

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            What is{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Persistent Cent
            </span>
            ?
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Persistent Cent (PCENT) is a next-generation ERC-20 token designed for
            sustainable growth and community empowerment. We believe finance
            should be accessible, transparent, and fair for everyone.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
