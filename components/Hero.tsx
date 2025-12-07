import React from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import LightPillar from './LightPillar';
import ElectricBorder from './ElectricBorder';
import { FaBrain, FaEye, FaEyeSlash, FaClipboardList, FaEnvelope } from 'react-icons/fa';
import { LuSwords } from "react-icons/lu";
import { LiquidButton } from './animate-ui/primitives/buttons/liquid';

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
          icon: FaBrain,
          title: "Deep Semantic Understanding",
          desc: "Artificial Intelligence (AI) reads resumes like a human, understanding career progression, gaps, and transferable skills beyond simple keyword matching.",
          color: "text-blue-500"
      },
      {
          icon: FaEye,
          title: "Multimodal Vision Analysis",
          desc: "Upload scanned PDFs or photos of resumes. Our OCR + Vision capabilities extract text and structure perfectly, even from images.",
          color: "text-purple-500"
      },
      {
          icon: LuSwords,
          title: "Candidate Battle Mode",
          desc: "Can't decide? Select candidates to run a side-by-side AI comparison matrix identifying the winner based on your specific dimensions.",
          color: "text-orange-500"
      },
      {
          icon: FaEyeSlash,
          title: "Bias-Free Blind Hiring",
          desc: "Toggle 'Blind Mode' to mask names, genders, and photos, allowing you to focus purely on skills and experience for a fair review.",
          color: "text-teal-500"
      },
      {
          icon: FaClipboardList,
          title: "Smart Interview Prep",
          desc: "Don't ask generic questions. The AI generates specific technical questions targeting the exact weaknesses identified in the candidate's profile.",
          color: "text-pink-500"
      },
      {
          icon: FaEnvelope,
          title: "Instant Outreach",
          desc: "Generate personalized, human-sounding interview invitations or rejection emails in one click, tailored to the candidate's unique background.",
          color: "text-indigo-500"
      }
  ];

  return (
    <div className="bg-slate-50 overflow-hidden font-sans">
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center pt-32 md:pt-40 pb-32 px-6 bg-black">
           {/* LightPillar Background */}
           <LightPillar 
             topColor="#f7911d" 
             bottomColor="#1916d0" 
             intensity={0.8}
             rotationSpeed={0.5}
             interactive={false}
             glowAmount={0.008}
             pillarWidth={2.5}
             pillarHeight={0.5}
             pillarRotation={25}
             noiseIntensity={0.3}
             className="opacity-60"
           />

           <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-20">
                {/* Text Content */}
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="text-center lg:text-left"
                >
                    <motion.div variants={fadeInUp} className="inline-block px-4 py-2 mb-6 rounded-full bg-orange-500/20 text-orange-200 font-semibold text-sm border border-orange-400/50 shadow-sm backdrop-blur-sm">
                        ✨ Powered by Artificial Intelligence (AI)
                    </motion.div>
                    <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
                        Recruiting at the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-blue-400">Speed of AI</span>
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-lg text-slate-200 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        Stop manually reviewing hundreds of PDF resumes. Our intelligent agent analyzes, ranks, and visualizes candidate potential in seconds using advanced multimodal AI.
                    </motion.p>
                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <LiquidButton 
                            onClick={onStart}
                            delay="0.3s"
                            fillHeight="3px"
                            hoverScale={1.05}
                            tapScale={0.95}
                            className="px-8 py-4 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 border-2 border-orange-500 [--liquid-button-color:#f97316] [--liquid-button-background-color:transparent] hover:text-black"
                        >
                            Start Analyzing Now
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </LiquidButton>
                        <LiquidButton 
                            asChild
                            delay="0.3s"
                            fillHeight="3px"
                            hoverScale={1.05}
                            tapScale={0.95}
                            className="px-8 py-4 text-white border-2 border-white/50 rounded-xl font-bold text-lg flex items-center justify-center [--liquid-button-color:#ffffff] [--liquid-button-background-color:transparent] hover:text-black"
                        >
                            <a href="#how-it-works">
                                Learn How
                            </a>
                        </LiquidButton>
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
        {/* <div className="py-10 border-y border-slate-100 bg-white/50 backdrop-blur-sm">
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
        </div> */}

        {/* FEATURES GRID */}
        <section className="py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-black relative overflow-hidden" id="features">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <h2 className="text-orange-500 font-semibold tracking-widest uppercase mb-4 text-sm">Capabilities</h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">More than just keyword matching.</h3>
                    <p className="text-lg text-gray-300">Our AI understands context, visual layouts, and nuanced job requirements, ensuring you never miss a hidden gem.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-orange-500/50 transition-all duration-300 overflow-hidden"
                        >
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-blue-500/0 group-hover:from-orange-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl"></div>
                            
                            <div className="relative z-10">
                                <motion.div 
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6 bg-gradient-to-br ${feature.color === 'text-blue-500' ? 'from-blue-500/20 to-blue-600/20' : feature.color === 'text-purple-500' ? 'from-purple-500/20 to-purple-600/20' : feature.color === 'text-orange-500' ? 'from-orange-500/20 to-orange-600/20' : feature.color === 'text-teal-500' ? 'from-teal-500/20 to-teal-600/20' : feature.color === 'text-pink-500' ? 'from-pink-500/20 to-pink-600/20' : 'from-indigo-500/20 to-indigo-600/20'}`}
                                >
                                    <feature.icon className={feature.color} />
                                </motion.div>
                                <h4 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">{feature.title}</h4>
                                <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-32 bg-gradient-to-b from-black via-slate-900 to-black text-white overflow-hidden relative" id="how-it-works">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/3 -left-40 w-80 h-80 bg-blue-500/5 rounded-full mix-blend-screen filter blur-3xl"></div>
              <div className="absolute bottom-1/3 -right-40 w-80 h-80 bg-orange-500/5 rounded-full mix-blend-screen filter blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">How it works</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">Simplify your hiring pipeline in three simple steps.</p>
                </motion.div>

                <div className="relative">
                    {/* Connecting Line (Desktop) - Behind circles */}
                    <div className="hidden md:block absolute top-14 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent -z-10"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Upload CVs", desc: "Drag & drop up to 10 PDF or Image resumes at once. We handle extraction securely.", icon: "📤" },
                            { step: "02", title: "Define Role", desc: "Set job title, description, skills, and adjust importance weights for ranking.", icon: "⚙️" },
                            { step: "03", title: "Get Results", desc: "Receive an AI-ranked list with detailed reasoning, pros, cons, and match scores.", icon: "✨" }
                        ].map((step, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.6 }}
                                className="relative text-center flex flex-col items-center"
                            >
                                <motion.div 
                                    whileHover={{ scale: 1.1 }}
                                    className="w-28 h-28 bg-slate-900 rounded-full border-2 border-orange-500/50 flex items-center justify-center text-4xl font-bold text-orange-400 mb-8 relative z-20 shadow-lg shadow-orange-500/20"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(15,23,42,1) 0%, rgba(15,23,42,0.95) 100%)'
                                    }}
                                >
                                    {step.step}
                                </motion.div>
                                <h3 className="text-2xl font-bold mb-3 text-white">{step.title}</h3>
                                <p className="text-gray-400 leading-relaxed max-w-xs">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* CTA BOTTOM */}
        <section className="py-32 bg-gradient-to-br from-orange-600 via-orange-500 to-blue-600 text-white text-center relative overflow-hidden">
             {/* Animated decorative elements */}
             <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse"></div>
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to find your next unicorn?</h2>
                    <p className="text-white/90 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">Join the future of recruitment. Fast, unbiased, and incredibly accurate analysis using Google's latest Gemini AI models.</p>
                    <LiquidButton 
                        onClick={onStart}
                        delay="0.3s"
                        fillHeight="3px"
                        hoverScale={1.05}
                        tapScale={0.95}
                        className="px-12 py-4 text-white rounded-full font-bold text-lg shadow-lg border-2 border-white [--liquid-button-color:#f97316] [--liquid-button-background-color:transparent] hover:text-black"
                    >
                        Launch TalentScout AI
                    </LiquidButton>
                </motion.div>
            </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-black border-t border-white/10 py-16">
            <div className="container mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row justify-between items-center"
                >
                    <div className="mb-8 md:mb-0">
                        <p className="text-lg font-bold text-white">TalentScout AI</p>
                        <p className="text-sm text-gray-400 mt-2">© 2024. All rights reserved.</p>
                    </div>
                    <div className="flex gap-8">
                        <motion.a 
                            href="#" 
                            whileHover={{ color: "#f7911d" }}
                            className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                        >
                            Privacy Policy
                        </motion.a>
                        <motion.a 
                            href="#" 
                            whileHover={{ color: "#f7911d" }}
                            className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                        >
                            Terms of Service
                        </motion.a>
                        <motion.a 
                            href="#" 
                            whileHover={{ color: "#f7911d" }}
                            className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
                        >
                            Contact Support
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </footer>
    </div>
  );
};

export default Hero;