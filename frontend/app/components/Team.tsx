"use client";

import { motion } from "framer-motion";

const team = [
  {
    name: "Alex Persistent",
    role: "Founder & Lead Developer",
    bio: "Blockchain engineer with 8+ years of experience in DeFi protocol development and smart contract security.",
    initials: "AP",
    color: "from-blue-400 to-blue-600",
  },
  {
    name: "Sarah Chen",
    role: "Community Lead",
    bio: "Crypto community strategist who has built and scaled multiple communities to 100k+ members.",
    initials: "SC",
    color: "from-purple-400 to-purple-600",
  },
  {
    name: "Marcus Rivera",
    role: "Smart Contract Engineer",
    bio: "Solidity developer with expertise in secure contract architecture and DeFi protocol design.",
    initials: "MR",
    color: "from-emerald-400 to-emerald-600",
  },
  {
    name: "Elena Volkova",
    role: "Marketing Director",
    bio: "Growth marketing specialist with deep experience in crypto brand building and strategic partnerships.",
    initials: "EV",
    color: "from-amber-400 to-amber-600",
  },
];

export default function Team() {
  return (
    <section id="team" className="py-24 px-6 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our Team
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            A dedicated team of builders, thinkers, and community advocates
            committed to making Persistent Cent a success.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300"
            >
              <div
                className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center`}
              >
                <span className="text-2xl font-bold text-white">
                  {member.initials}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-blue-400 mb-3">{member.role}</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
