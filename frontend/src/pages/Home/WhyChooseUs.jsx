import React from 'react';
import { ShieldCheck, Compass, Users, Scale } from 'lucide-react';

const WhyChooseUs = () => {
  const pillars = [
    {
      icon: ShieldCheck,
      title: 'MahaRERA & Sanctions Vetted',
      desc: 'Every project, apartment tower, and plotted enclave undergoes independent validation against state regulatory records and NMRDA development plans.',
    },
    {
      icon: Compass,
      title: 'Hyperlocal Nagpur Precision',
      desc: 'Unmatched micro-market command across Civil Lines, Dharampeth, Ramdaspeth, Wardha Road, and emerging logistics corridors.',
    },
    {
      icon: Users,
      title: 'Direct Principal Access',
      desc: 'Transparent engagement connecting discerning buyers directly with verified asset owners and credentialed advisory agents without intermediary friction.',
    },
    {
      icon: Scale,
      title: 'Institutional Title Scrutiny',
      desc: 'Structured legal diligence covering Satbara 7/12 land abstracts, non-agricultural sanctions, and encumbrance certifications in Nagpur registries.',
    },
  ];

  return (
    <section className="py-24 bg-ivory-light border-t border-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 text-[10px] font-semibold uppercase tracking-luxury text-gold border border-gold/40 px-3.5 py-1 bg-white mb-3">
            <span>The Institutional Advantage</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-navy font-normal tracking-tight">
            Distinction in Real Estate Advisory
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-3 font-sans leading-relaxed">
            Nagpur Estates establishes benchmark data integrity, regulatory compliance, and architectural connoisseurship for the Vidarbha region.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="bg-white p-8 border border-beige hover:border-gold transition-colors duration-300 shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 border border-beige flex items-center justify-center mb-6 bg-ivory text-gold">
                  <p.icon className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-lg font-normal text-navy mb-3">{p.title}</h3>
                <p className="text-xs text-charcoal-light leading-relaxed font-sans">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
