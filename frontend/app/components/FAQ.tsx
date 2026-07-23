"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is Persistent Cent (PCENT)?",
    answer:
      "Persistent Cent (PCENT) is a community-driven ERC-20 token built on Ethereum. It features a fair launch, locked liquidity, and transparent tokenomics designed for long-term sustainable growth.",
  },
  {
    question: "How do I participate in the presale?",
    answer:
      "To participate, connect your MetaMask wallet, ensure you have ETH on the correct network, and use the presale widget on this page. The minimum contribution is 0.01 ETH and the maximum is 10 ETH per wallet.",
  },
  {
    question: "When will the presale start and end?",
    answer:
      "The presale dates are displayed in the presale widget above. The presale runs for approximately 14 days or until the hard cap is reached, whichever comes first.",
  },
  {
    question: "What happens after the presale?",
    answer:
      "After the presale ends, the team will finalize the distribution, create the liquidity pool on Uniswap, and lock the liquidity tokens. Unsold tokens will be burned. The team allocation is vested and released gradually.",
  },
  {
    question: "Is the contract audited?",
    answer:
      "Yes, the smart contract will be audited by a reputable third-party firm before the presale. The audit report will be published on our website and social channels.",
  },
  {
    question: "Is there a whitelist?",
    answer:
      "The presale may include a whitelist phase. Check our social channels for the most up-to-date information on whitelist availability and timelines.",
  },
  {
    question: "How is the team's allocation handled?",
    answer:
      "The team allocation of 15% is vested and will be released gradually over time to ensure alignment with the long-term success of the project. No team tokens are available during the presale.",
  },
  {
    question: "Will there be a CEX listing?",
    answer:
      "Yes, after the initial DEX listing and community growth, we plan to apply for listings on centralized exchanges. Specific timelines will be announced as we progress through our roadmap.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-300">
            Everything you need to know about Persistent Cent.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-white font-medium pr-4">
                  {faq.question}
                </span>
                <motion.svg
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-5 text-slate-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-slate-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
