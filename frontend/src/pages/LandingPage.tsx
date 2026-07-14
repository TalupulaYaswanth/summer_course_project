import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Zap, Layers, Lock, Sparkles, HelpCircle, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { token } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-accentPurpleLight" />,
      title: "Plain-English Summaries",
      desc: "Converts nested functions, logic loops, and confusing statements into simplified layman vocabulary."
    },
    {
      icon: <Terminal className="w-6 h-6 text-accentEmerald" />,
      title: "Line-by-Line Breakdown",
      desc: "Traces your blocks step-by-step with structured commentary tables mapping line statements to descriptions."
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Dry Run Simulation",
      desc: "Simulates variable state transitions inside loops and recursive conditions through visual timeline traces."
    },
    {
      icon: <Layers className="w-6 h-6 text-blue-400" />,
      title: "Big O Analysis",
      desc: "Calculates Average, Worst, and Best case Space/Time complexity metrics with concise mathematical rationale."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-pink-400" />,
      title: "Interview Prep & Quiz Mode",
      desc: "Generates difficulty-ranked interview questions and interactively tests code understanding with MCQs."
    },
    {
      icon: <Lock className="w-6 h-6 text-red-400" />,
      title: "Security Scanner",
      desc: "Analyzes inputs for injection vectors, infinite executions, race loops, overflows, and code smells."
    }
  ];

  const workflow = [
    { step: "01", title: "Paste Code Snippet", desc: "Supports Python, JavaScript, Java, C++, Go, HTML, SQL, Rust, and more. Load sample algorithms to test instantly." },
    { step: "02", title: "Process with Gemini", desc: "Code gets analyzed using Google's latest Gemini reasoning model with optimized strict schemas." },
    { step: "03", title: "Study Structured Output", desc: "Explore summary cards, line commentators, interactive quizzes, dry runs, and refactored side-by-side diffs." }
  ];

  const faqs = [
    { q: "How does the Plain-English translation work?", a: "We parse code inputs and use Google's Gemini models with custom instructions to deconstruct logic steps into conversational English suitable for beginners." },
    { q: "Which programming languages are supported?", a: "All major languages are supported including Python, JavaScript, TypeScript, Go, C++, Java, Rust, Swift, PHP, SQL, Bash/Shell, HTML, and CSS." },
    { q: "Do I need a custom API key?", a: "No, a fallback system key is active. However, entering your personal Google Gemini API Key in Settings removes rate limits and unlocks faster processing." },
    { q: "Can I export code explanations?", a: "Yes! Explanations can be easily copied to your clipboard, and you can bookmark favorite snippets to search them in your dashboard history later." }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 flex flex-col items-center text-center overflow-hidden border-b border-borderDark/20">
        {/* Glow meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accentPurple/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-accentEmerald/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 text-sm text-accentPurpleLight font-semibold">
            <Sparkles className="w-4 h-4 animate-pulse" /> AI-Powered Code Tutor is live
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none mb-6">
            Understand Complex Code in{" "}
            <span className="bg-gradient-to-r from-accentPurpleLight to-accentPurple bg-clip-text text-transparent">
              Plain English
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop scratching your head. Paste your code and instantly get detailed visual commentary, dry run timeline simulations, Big O complexity charts, and interactive learning quizzes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={token ? "/dashboard" : "/signup"}
              className="px-8 py-3.5 rounded-xl font-bold text-white glass-btn transition-all text-base w-full sm:w-auto text-center"
            >
              Start Explaining Code Free
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 rounded-xl font-semibold text-slate-300 hover:text-white bg-white/5 border border-slate-700/50 hover:bg-white/10 transition-all text-base w-full sm:w-auto text-center"
            >
              See How It Works
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Features Engineered for Learning</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Deconstruct any algorithmic implementation with a wide array of conceptual and security analysis reports.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feat, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="glass-card p-8 rounded-2xl flex flex-col hover:border-accentPurple/40 transition-colors group cursor-pointer"
            >
              <div className="mb-5 p-3 rounded-xl bg-white/5 border border-white/10 w-fit group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-accentPurpleLight transition-colors">
                {feat.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it Works section */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.01] border-y border-borderDark/20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How CodeExplain Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Go from confusing syntax lines to a clean visual workbook in three quick steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {workflow.map((work, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center">
                <div className="text-6xl font-black text-white/5 absolute -top-8 left-1/2 -translate-x-1/2 select-none z-0">
                  {work.step}
                </div>
                <div className="w-12 h-12 rounded-full bg-accentPurple text-white font-bold flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-accentPurple/30">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{work.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{work.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="py-24 px-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Got questions? We've got answers.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="glass-card rounded-xl border border-borderDark/50 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-white hover:bg-white/[0.02]"
              >
                <span>{faq.q}</span>
                <HelpCircle className={`w-5 h-5 text-accentPurpleLight transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              
              {activeFaq === idx && (
                <div className="px-6 pb-6 pt-1 text-slate-400 text-sm leading-relaxed border-t border-borderDark/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Wrapper */}
      <footer className="mt-auto py-12 px-6 border-t border-borderDark/40 bg-darkBg text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 text-base">⚡ CodeExplain</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/login" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link to="/dashboard" className="hover:text-slate-300 transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
