import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, CheckCircle2, Users, FileText, Sparkles, MapPin } from 'lucide-react';

const WhyChooseUs = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50',
      title: '100% MahaRERA Verified',
      desc: 'Every listed project and property undergoes scrutiny against Maharashtra Real Estate Regulatory Authority records.',
    },
    {
      icon: MapPin,
      color: 'text-brand-orange bg-orange-50',
      title: 'Nagpur Centric Precision',
      desc: 'Deep local knowledge of Dharampeth, Manish Nagar, Wardha Road, Besa, Hingna, and emerging NMRDA developments.',
    },
    {
      icon: Users,
      color: 'text-brand-teal bg-teal-50',
      title: 'Direct Owner & Agent Access',
      desc: 'Connect straight away over phone call or WhatsApp with zero hidden matchmaking fees.',
    },
    {
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
      title: 'Legal & Satbara 7/12 Assistance',
      desc: 'Guidance through title searches, encumbrance certificates, and registration formalities in Nagpur sub-registrar offices.',
    },
  ];

  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-brand-teal bg-teal-50 px-3 py-1 rounded-full mb-2 border border-teal-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Nagpur Advantage</span>
          </div>
          <h2 className="text-3xl font-black text-brand-navy">
            {t('sections.whyUsTitle')}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {t('sections.whyUsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 hover:bg-white hover:shadow-card transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
