import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserCheck, Server, Cpu, Database, 
  ArrowRight, Key, Terminal, ArrowRightLeft, Sparkles 
} from 'lucide-react';

interface WorkflowStep {
  title: string;
  sender: string;
  receiver: string;
  desc: string;
  icon: React.ReactNode;
  data: string;
}

export const WorkflowPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const steps: WorkflowStep[] = [
    {
      title: "1. Secure Registration & Authentication Handshake",
      sender: "React Frontend",
      receiver: "FastAPI Backend",
      desc: "When a user signs up or signs in, their password is securely hashed via Bcrypt inside the SQLite DB. FastAPI responds by generating a stateless JWT (JSON Web Token) bearer key.",
      icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
      data: "Email & Hashed Hash values -> JWT Token returned"
    },
    {
      title: "2. Editor Code Capture",
      sender: "Monaco Editor Sandbox",
      receiver: "Frontend Session State",
      desc: "The code script is captured directly from the Monaco Editor, bound to the user's selected language environment rules and Gemini reasoning model configurations.",
      icon: <Terminal className="w-5 h-5 text-indigo-600" />,
      data: "Code text string, selected language, LLM choice"
    },
    {
      title: "3. API Server Validation Interceptor",
      sender: "Axios client request",
      receiver: "FastAPI endpoints",
      desc: "FastAPI intercepts the incoming HTTP POST request, decodes the bearer JWT token in the header, validates session permissions, and checks user records in the SQLite database.",
      icon: <Server className="w-5 h-5 text-sky-600" />,
      data: "Bearer token verified, user profiles decoded"
    },
    {
      title: "4. Structured AI Generation Handshake",
      sender: "FastAPI Backend Server",
      receiver: "Google Gemini API",
      desc: "FastAPI connects to Google's generative models with a strict Pydantic JSON structure constraint. Gemini processes the source logic and forces a structured walkthrough JSON response.",
      icon: <Cpu className="w-5 h-5 text-accentPurple" />,
      data: "Strict Pydantic JSON model formatting query"
    },
    {
      title: "5. SQLite Repository Logging",
      sender: "SQLAlchemy ORM engine",
      receiver: "SQLite database",
      desc: "FastAPI receives the formatted explanation JSON payload, serializes the complexity metrics and line commentary lists, and persists the runs to history tables for future bookmarks.",
      icon: <Database className="w-5 h-5 text-amber-600" />,
      data: "New Explanation database row with JSON serialized content"
    },
    {
      title: "6. Frontend Conceptual Rendering",
      sender: "Vite compiled runtime",
      receiver: "User Browser viewport",
      desc: "React receives the JSON response and mounts five dynamic workspaces: Layman translations, Big O meters, comparative diff refactors, exercises, and mock interview prep accordions.",
      icon: <Sparkles className="w-5 h-5 text-teal-600" />,
      data: "Formatted code explanations, complexity cards, interactive quizzes"
    }
  ];

  return (
    <div className="flex-1 min-h-screen bg-darkBg text-slate-800 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Title */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accentPurple/10 border border-accentPurple/20 text-xs font-semibold text-accentPurple shadow-sm"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> Full-Stack Architecture
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900"
          >
            System Data Journey
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base"
          >
            How does code get parsed? Explore the live lifecycle of data routing through our client interfaces, security servers, databases, and Google's generative models.
          </motion.p>
        </div>

        {/* Dynamic Stepper Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-accentPurple/30 transition-colors"
            >
              <div className="space-y-4">
                {/* Header step icon badge */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 w-fit">
                    {step.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                    STEP 0{idx + 1}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">{step.title}</h3>
                  <div className="text-[10px] font-semibold text-accentPurple uppercase tracking-wider flex items-center gap-1">
                    <span>{step.sender}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>{step.receiver}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Data payload preview block */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Payload Handled</span>
                <code className="text-[10px] font-mono block bg-slate-50 p-2 rounded border border-slate-200 text-slate-700 truncate" title={step.data}>
                  {step.data}
                </code>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Visual Map Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-8 rounded-2xl border border-slate-200 text-center space-y-6 shadow-sm max-w-4xl mx-auto"
        >
          <h3 className="text-xl font-bold text-slate-900">Unified Architecture Map</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 items-center gap-4 text-xs font-semibold">
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-2 shadow-sm">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              <span>User Client</span>
            </div>
            
            <div className="hidden md:flex justify-center text-slate-400">
              <ArrowRight className="w-6 h-6" />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-2 shadow-sm">
              <Server className="w-6 h-6 text-sky-600" />
              <span>FastAPI Gateway</span>
            </div>

            <div className="hidden md:flex justify-center text-slate-400">
              <ArrowRight className="w-6 h-6" />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center gap-2 shadow-sm">
              <Cpu className="w-6 h-6 text-accentPurple" />
              <span>Gemini AI Engine</span>
            </div>

          </div>

          <div className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed pt-2">
            Database read/writes run asynchronously in parallel with client sessions to log results, preventing main-thread execution blocks.
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default WorkflowPage;
