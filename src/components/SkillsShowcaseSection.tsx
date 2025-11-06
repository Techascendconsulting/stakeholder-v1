import { motion } from "framer-motion";

export function SkillsShowcaseSection() {
  return (
    <section className="w-full bg-white text-gray-900 py-24 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-xs tracking-[0.2em] text-gray-500 mb-4">PROFESSIONAL</p>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          TRANSFORM YOUR BUSINESS <br /> ANALYSIS SKILLS
        </h2>
        <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
          Comprehensive guided practice for aspiring and experienced business analysts.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* CARD 1 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileHover={{ y: -8 }}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-6 flex-grow">
            <p className="text-xs uppercase text-gray-500 mb-2">Real</p>
            <h3 className="text-xl font-bold leading-snug mb-3">Do the actual work</h3>
            <p className="text-sm text-gray-600 mb-6">
              Engage in practical, hands-on business analysis tasks.
            </p>
          </div>
          <div className="h-48 overflow-hidden">
            <img 
              src="/images/collaborate.jpg" 
              alt="Collaboration" 
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* CARD 2 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileHover={{ y: -8 }}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-6 flex-grow">
            <p className="text-xs uppercase text-gray-500 mb-2">Confident</p>
            <h3 className="text-xl font-bold leading-snug mb-3">Speak with clarity and expertise</h3>
            <p className="text-sm text-gray-600 mb-6">
              Develop real communication skills inside professional environments.
            </p>
          </div>
          <div className="h-48 overflow-hidden">
            <img 
              src="/images/collaborate2.jpg" 
              alt="Professional communication" 
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* CARD 3 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          whileHover={{ y: -8 }}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-6 flex-grow">
            <p className="text-xs uppercase text-gray-500 mb-2">Proven</p>
            <h3 className="text-xl font-bold leading-snug mb-3">
              Create deliverables you can showcase
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Build a portfolio of professional work samples.
            </p>
          </div>
          <div className="h-48 overflow-hidden">
            <img 
              src="/images/home2.jpg" 
              alt="Professional deliverables" 
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
