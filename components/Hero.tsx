import React from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';

interface HeroProps {
  onStart: () => void;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Blob = ({ className, delay = 0 }: { className: string, delay?: number }) => (
  <motion.div
    animate={{
      scale: [1, 1.2, 1],
      rotate: [0, 90, 0],
      opacity: [0.4, 0.2, 0.4]
    }}
    transition={{
      duration: 15,
      repeat: Infinity,
      ease: "linear",
      delay: delay
    }}
    className={`absolute rounded-full mix-blend-multiply filter blur-3xl ${className}`}
  />
);

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const features = [
      {
          icon: "🧠",
          title: "Deep Semantic Understanding",
          desc: "Artificial Intelligence (AI) reads resumes like a human, understanding career progression, gaps, and transferable skills beyond simple keyword matching.",
          color: "bg-blue-50 text-blue-600"
      },
      {
          icon: "👁️",
          title: "Multimodal Vision Analysis",
          desc: "Upload scanned PDFs or photos of resumes. Our OCR + Vision capabilities extract text and structure perfectly, even from images.",
          color: "bg-purple-50 text-purple-600"
      },
      {
          icon: "⚔️",
          title: "Candidate Battle Mode",
          desc: "Can't decide? Select candidates to run a side-by-side AI comparison matrix identifying the winner based on your specific dimensions.",
          color: "bg-orange-50 text-orange-600"
      },
      {
          icon: "🙈",
          title: "Bias-Free Blind Hiring",
          desc: "Toggle 'Blind Mode' to mask names, genders, and photos, allowing you to focus purely on skills and experience for a fair review.",
          color: "bg-teal-50 text-teal-600"
      },
      {
          icon: "📝",
          title: "Smart Interview Prep",
          desc: "Don't ask generic questions. The AI generates specific technical questions targeting the exact weaknesses identified in the candidate's profile.",
          color: "bg-pink-50 text-pink-600"
      },
      {
          icon: "✉️",
          title: "Instant Outreach",
          desc: "Generate personalized, human-sounding interview invitations or rejection emails in one click, tailored to the candidate's unique background.",
          color: "bg-indigo-50 text-indigo-600"
      }
  ];

  return (
    <div className="bg-slate-50 overflow-hidden font-sans">
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-6">
           {/* Background blobs */}
           <Blob className="top-0 -left-4 w-96 h-96 bg-purple-300" delay={0} />
           <Blob className="top-0 -right-4 w-96 h-96 bg-indigo-300" delay={5} />
           <Blob className="-bottom-8 left-20 w-96 h-96 bg-pink-300" delay={2} />

           <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Text Content */}
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="text-center lg:text-left"
                >
                    <motion.div variants={fadeInUp} className="inline-block px-4 py-2 mb-6 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm border border-indigo-100 shadow-sm backdrop-blur-sm">
                        ✨ Powered by Artificial Intelligence (AI)
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                        Recruiting at the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Speed of AI</span>
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        Stop manually reviewing hundreds of PDF resumes. Our intelligent agent analyzes, ranks, and visualizes candidate potential in seconds using advanced multimodal AI.
                    </motion.p>
                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button 
                            onClick={onStart}
                            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                        >
                            Start Analyzing Now
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </button>
                        <a href="#how-it-works" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center">
                            Learn How
                        </a>
                    </motion.div>
                </motion.div>

                {/* Visual / Graphic */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="relative hidden lg:block"
                >
                    {/* Abstract Floating Cards */}
                    <motion.div 
                        animate={{ y: [0, -15, 0] }} 
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="relative z-20 bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/50 max-w-md mx-auto"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">👨‍💻</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 text-lg">Senior React Developer</h3>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">98% Match</span>
                                </div>
                                <p className="text-sm text-slate-500">Alex Johnston • 8 Years Exp</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Technical Skills</span>
                                    <span>9.5/10</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: "95%" }}
                                        transition={{ duration: 1.5, delay: 1 }}
                                        className="h-full bg-indigo-500"
                                    />
                                </div>
                            </div>
                             <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Experience Fit</span>
                                    <span>8.8/10</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: "88%" }}
                                        transition={{ duration: 1.5, delay: 1.2 }}
                                        className="h-full bg-purple-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium">React</span>
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium">Node.js</span>
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium">Cloud</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Background decoration for the card */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -z-10"></div>
                </motion.div>
           </div>
        </section>

        {/* LOGO STRIP */}
        <div className="py-10 border-y border-slate-100 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-6 text-center">
                <p className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wider">Built with modern AI stack</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                     <span className="flex items-center gap-2 font-bold text-xl text-slate-700"><span className="text-blue-500">G</span> Gemini 1.5/3.0</span>
                     <span className="flex items-center gap-2 font-bold text-xl text-slate-700">Next.js 16</span>
                     <span className="flex items-center gap-2 font-bold text-xl text-slate-700">TypeScript</span>
                     <span className="flex items-center gap-2 font-bold text-xl text-slate-700">Tailwind</span>
                     <span className="flex items-center gap-2 font-bold text-xl text-slate-700">Framer Motion</span>
                </div>
            </div>
        </div>

        {/* FEATURES GRID */}
        <section className="py-24 bg-white" id="features">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-indigo-600 font-semibold tracking-wide uppercase mb-3">Capabilities</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">More than just keyword matching.</h3>
                    <p className="text-lg text-slate-600">Our AI understands context, visual layouts, and nuanced job requirements, ensuring you never miss a hidden gem.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                            <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative" id="how-it-works">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">How it works</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">Simplify your hiring pipeline in three simple steps.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30"></div>

                    {[
                        { step: "01", title: "Upload CVs", desc: "Drag & drop up to 10 PDF or Image resumes at once. We handle extraction securely." },
                        { step: "02", title: "Define Role", desc: "Set job title, description, skills, and adjust importance weights for ranking." },
                        { step: "03", title: "Get Results", desc: "Receive an AI-ranked list with detailed reasoning, pros, cons, and match scores." }
                    ].map((step, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="relative text-center"
                        >
                            <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full border-4 border-slate-700 flex items-center justify-center text-3xl font-bold text-indigo-400 mb-6 relative z-10 shadow-lg shadow-indigo-900/50">
                                {step.step}
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                            <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA BOTTOM */}
        <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center relative overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to find your next unicorn?</h2>
                    <p className="text-indigo-100 text-xl mb-10 max-w-2xl mx-auto">Join the future of recruitment. Fast, unbiased, and incredibly accurate analysis using Google's latest Gemini AI models.</p>
                    <button 
                        onClick={onStart}
                        className="px-10 py-5 bg-white text-indigo-600 rounded-full font-bold text-lg shadow-2xl hover:bg-slate-50 hover:scale-105 transition-all"
                    >
                        Launch TalentScout AI
                    </button>
                </motion.div>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-slate-50 py-12 border-t border-slate-200">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-60">
                <div className="mb-4 md:mb-0">
                    <p className="text-sm font-semibold text-slate-900">TalentScout AI</p>
                    <p className="text-xs mt-1">© 2024. All rights reserved.</p>
                </div>
                <div className="flex gap-6">
                    <a href="#" className="text-sm hover:text-indigo-600 transition-colors">Privacy Policy</a>
                    <a href="#" className="text-sm hover:text-indigo-600 transition-colors">Terms of Service</a>
                    <a href="#" className="text-sm hover:text-indigo-600 transition-colors">Contact Support</a>
                </div>
            </div>
        </footer>
    </div>
  );
};

export default Hero;