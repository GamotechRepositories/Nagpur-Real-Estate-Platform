import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, User, Share2, BookOpen, CheckCircle2 } from 'lucide-react';
import apiClient from '../../api/client';

const STATIC_FALLBACK_CONTENT = {
  'terms-of-service': {
    title: 'Terms of Service & Platform Guidelines',
    category: 'LEGAL',
    readTime: '6 min read',
    publishedAt: '2026-01-15',
    author: 'Nagpur Estates Legal Advisory',
    excerpt: 'Detailed terms and compliance framework governing real estate listings, agent accreditation, and consumer rights in Nagpur.',
    body: `
      <h3>1. Agreement to Terms</h3>
      <p>By accessing or using Nagpur Estates (nagpurestate.com), you agree to comply with and be bound by these Terms of Service. Our platform functions as an exclusive digital real estate marketplace connecting verified developers, certified brokers, and discerning buyers across Nagpur, Maharashtra.</p>
      
      <h3>2. Listing Authenticity & MahaRERA Compliance</h3>
      <p>Every commercial development, residential project, and plotted layout advertised on this platform must comply with the Real Estate (Regulation and Development) Act, 2016 (MahaRERA). Listing creators warrant that all sanctions, floor plans, pricing sheets, and project completion dates are accurate and approved by the Nagpur Municipal Corporation (NMC) or Nagpur Metropolitan Region Development Authority (NMRDA).</p>
      
      <h3>3. 90-Day Listing Lifecycle & Verification</h3>
      <p>To ensure high data hygiene and eliminate ghost listings, properties published on Nagpur Estates remain active for a maximum duration of 90 days. Property owners and authorized agents must re-validate availability, price adjustments, or occupancy status prior to cycle expiration.</p>

      <h3>4. User Privacy & Lead Routing</h3>
      <p>Direct inquiries, site visit requests, and contact details shared on this portal are handled under strict confidentiality protocols. Data is transmitted exclusively to the verified listing owner or our dedicated concierge team to facilitate legitimate viewings.</p>
    `
  },
  'privacy-policy': {
    title: 'Privacy Policy & Data Governance',
    category: 'LEGAL',
    readTime: '5 min read',
    publishedAt: '2026-01-15',
    author: 'Nagpur Estates Trust & Safety',
    excerpt: 'How Nagpur Estates safeguards customer records, authentication credentials, and search preferences.',
    body: `
      <h3>1. Information Collection</h3>
      <p>We collect essential information required to verify buyer eligibility, facilitate instant WhatsApp and SMS communication, and authenticate verified property listings. This includes mobile phone numbers verified via secure one-time passwords (OTP), verified email addresses, and geographical search parameters.</p>
      
      <h3>2. Data Usage & Security</h3>
      <p>Under no circumstances are customer databases sold or rented to third-party marketing entities. Information is strictly utilized for user session management, automated property alerts, scheduled site visit coordination, and platform security audits.</p>
      
      <h3>3. Cookies and Analytics</h3>
      <p>We deploy standard session cookies and privacy-preserving analytics to personalize locality insights, remember currency formatting preferences, and monitor platform performance across devices.</p>
    `
  },
  'rera-compliance-guide': {
    title: 'MahaRERA Compliance & Buyer Protection Guide',
    category: 'GUIDE',
    readTime: '8 min read',
    publishedAt: '2026-02-01',
    author: 'Advisory Editorial Board',
    excerpt: 'A comprehensive checklist for purchasing residential apartments and NMRDA plots in Nagpur with absolute legal clarity.',
    body: `
      <h3>1. The Role of MahaRERA in Nagpur</h3>
      <p>The Maharashtra Real Estate Regulatory Authority (MahaRERA) guarantees transparency and accountability in real estate transactions. In Nagpur, all ongoing and new residential projects spanning more than 500 square meters or encompassing eight or more apartments must possess a valid MahaRERA registration number.</p>
      
      <h3>2. Verifying Sanctions & Title Clearances</h3>
      <p>Prior to booking an apartment in high-growth corridors such as Wardha Road, Besa, or Manish Nagar, buyers should inspect the approved building sanctions from NMC/NMRDA, non-agricultural (NA) conversion certificates, and Commencement Certificates (CC).</p>
      
      <h3>3. Dedicated Escrow Accounts</h3>
      <p>Under MahaRERA mandates, developers are legally obligated to deposit 70% of collections from allottees into a dedicated escrow account in a scheduled commercial bank, ensuring capital is exclusively deployed toward land costs and construction milestones.</p>
    `
  }
};

const ContentDetailsPage = () => {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/content/${slug}`);
        if (isMounted && res.data?.data) {
          setContent(res.data.data);
        } else if (isMounted && STATIC_FALLBACK_CONTENT[slug]) {
          setContent(STATIC_FALLBACK_CONTENT[slug]);
        }
      } catch (err) {
        if (isMounted) {
          setContent(STATIC_FALLBACK_CONTENT[slug] || {
            title: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Editorial Article',
            category: 'EDITORIAL',
            readTime: '4 min read',
            publishedAt: '2026-02-10',
            author: 'Nagpur Estates Editorial Desk',
            excerpt: 'Exclusive insights into residential luxury, plotted infrastructure, and urban planning across Nagpur.',
            body: `<p>Welcome to Nagpur Estates editorial documentation. This comprehensive resource covers market dynamics, civic infrastructure expansions (including Nagpur Metro Phase II and MIHAN SEZ developments), and curated architectural insights.</p><p>For personalized property advisory or investment consultation, reach out to our concierge desk at Civil Lines, Nagpur.</p>`
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticle();
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-light py-12 md:py-20">
      <Helmet>
        <title>{content?.title ? `${content.title} | Nagpur Estates` : 'Article | Nagpur Estates'}</title>
        <meta name="description" content={content?.excerpt || 'Editorial publication by Nagpur Estates.'} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-xs uppercase tracking-luxury text-charcoal-muted hover:text-navy transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Editorial Article Header */}
        <article className="bg-white border border-beige p-8 md:p-14 shadow-subtle">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-luxury text-gold border border-gold/40 px-3 py-1 bg-ivory">
              {content?.category || 'ARTICLE'}
            </span>
            <span className="text-xs text-charcoal-muted flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {content?.publishedAt ? new Date(content.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '2026'}
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl text-navy leading-tight tracking-tight mb-6">
            {content?.title}
          </h1>

          {content?.excerpt && (
            <p className="text-base md:text-lg text-charcoal-light leading-relaxed border-l-2 border-gold pl-4 py-1 mb-8 italic">
              {content.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between py-4 border-y border-beige text-xs text-charcoal-muted mb-10">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gold" />
              <span className="font-medium text-navy">{content?.author || 'Nagpur Estates Editorial Desk'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1 text-gold" />
                {content?.readTime || '5 min read'}
              </span>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: content?.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Article link copied to clipboard.');
                  }
                }}
                className="hover:text-navy transition-colors inline-flex items-center"
                title="Share Article"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </button>
            </div>
          </div>

          {/* Editorial Content Prose */}
          <div
            className="prose prose-slate max-w-none text-charcoal leading-relaxed font-sans space-y-6 text-sm md:text-base [&>h3]:font-serif [&>h3]:text-2xl [&>h3]:text-navy [&>h3]:font-normal [&>h3]:mt-8 [&>h3]:mb-3 [&>p]:leading-relaxed [&>p]:text-charcoal-light"
            dangerouslySetInnerHTML={{ __html: content?.body || '' }}
          />

          {/* MahaRERA Compliance Assurance Notice */}
          <div className="mt-12 p-6 bg-ivory border border-beige flex items-start space-x-4">
            <CheckCircle2 className="w-6 h-6 text-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif text-base text-navy font-semibold mb-1">MahaRERA Advisory Note</h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Nagpur Estates strictly enforces Maharashtra Real Estate Regulatory Authority standards. Buyers are encouraged to independently verify project registrations at maharera.mahaonline.gov.in.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ContentDetailsPage;
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, User, Share2, BookOpen, CheckCircle2 } from 'lucide-react';
import apiClient from '../../api/client';

const STATIC_FALLBACK_CONTENT = {
  'terms-of-service': {
    title: 'Terms of Service & Platform Guidelines',
    category: 'LEGAL',
    readTime: '6 min read',
    publishedAt: '2026-01-15',
    author: 'Nagpur Estates Legal Advisory',
    excerpt: 'Detailed terms and compliance framework governing real estate listings, agent accreditation, and consumer rights in Nagpur.',
    body: `
      <h3>1. Agreement to Terms</h3>
      <p>By accessing or using Nagpur Estates (nagpurestate.com), you agree to comply with and be bound by these Terms of Service. Our platform functions as an exclusive digital real estate marketplace connecting verified developers, certified brokers, and discerning buyers across Nagpur, Maharashtra.</p>
      
      <h3>2. Listing Authenticity & MahaRERA Compliance</h3>
      <p>Every commercial development, residential project, and plotted layout advertised on this platform must comply with the Real Estate (Regulation and Development) Act, 2016 (MahaRERA). Listing creators warrant that all sanctions, floor plans, pricing sheets, and project completion dates are accurate and approved by the Nagpur Municipal Corporation (NMC) or Nagpur Metropolitan Region Development Authority (NMRDA).</p>
      
      <h3>3. 90-Day Listing Lifecycle & Verification</h3>
      <p>To ensure high data hygiene and eliminate ghost listings, properties published on Nagpur Estates remain active for a maximum duration of 90 days. Property owners and authorized agents must re-validate availability, price adjustments, or occupancy status prior to cycle expiration.</p>

      <h3>4. User Privacy & Lead Routing</h3>
      <p>Direct inquiries, site visit requests, and contact details shared on this portal are handled under strict confidentiality protocols. Data is transmitted exclusively to the verified listing owner or our dedicated concierge team to facilitate legitimate viewings.</p>
    `
  },
  'privacy-policy': {
    title: 'Privacy Policy & Data Governance',
    category: 'LEGAL',
    readTime: '5 min read',
    publishedAt: '2026-01-15',
    author: 'Nagpur Estates Trust & Safety',
    excerpt: 'How Nagpur Estates safeguards customer records, authentication credentials, and search preferences.',
    body: `
      <h3>1. Information Collection</h3>
      <p>We collect essential information required to verify buyer eligibility, facilitate instant WhatsApp and SMS communication, and authenticate verified property listings. This includes mobile phone numbers verified via secure one-time passwords (OTP), verified email addresses, and geographical search parameters.</p>
      
      <h3>2. Data Usage & Security</h3>
      <p>Under no circumstances are customer databases sold or rented to third-party marketing entities. Information is strictly utilized for user session management, automated property alerts, scheduled site visit coordination, and platform security audits.</p>
      
      <h3>3. Cookies and Analytics</h3>
      <p>We deploy standard session cookies and privacy-preserving analytics to personalize locality insights, remember currency formatting preferences, and monitor platform performance across devices.</p>
    `
  },
  'rera-compliance-guide': {
    title: 'MahaRERA Compliance & Buyer Protection Guide',
    category: 'GUIDE',
    readTime: '8 min read',
    publishedAt: '2026-02-01',
    author: 'Advisory Editorial Board',
    excerpt: 'A comprehensive checklist for purchasing residential apartments and NMRDA plots in Nagpur with absolute legal clarity.',
    body: `
      <h3>1. The Role of MahaRERA in Nagpur</h3>
      <p>The Maharashtra Real Estate Regulatory Authority (MahaRERA) guarantees transparency and accountability in real estate transactions. In Nagpur, all ongoing and new residential projects spanning more than 500 square meters or encompassing eight or more apartments must possess a valid MahaRERA registration number.</p>
      
      <h3>2. Verifying Sanctions & Title Clearances</h3>
      <p>Prior to booking an apartment in high-growth corridors such as Wardha Road, Besa, or Manish Nagar, buyers should inspect the approved building sanctions from NMC/NMRDA, non-agricultural (NA) conversion certificates, and Commencement Certificates (CC).</p>
      
      <h3>3. Dedicated Escrow Accounts</h3>
      <p>Under MahaRERA mandates, developers are legally obligated to deposit 70% of collections from allottees into a dedicated escrow account in a scheduled commercial bank, ensuring capital is exclusively deployed toward land costs and construction milestones.</p>
    `
  }
};

const ContentDetailsPage = () => {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/content/${slug}`);
        if (isMounted && res.data?.data) {
          setContent(res.data.data);
        } else if (isMounted && STATIC_FALLBACK_CONTENT[slug]) {
          setContent(STATIC_FALLBACK_CONTENT[slug]);
        }
      } catch (err) {
        if (isMounted) {
          setContent(STATIC_FALLBACK_CONTENT[slug] || {
            title: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Editorial Article',
            category: 'EDITORIAL',
            readTime: '4 min read',
            publishedAt: '2026-02-10',
            author: 'Nagpur Estates Editorial Desk',
            excerpt: 'Exclusive insights into residential luxury, plotted infrastructure, and urban planning across Nagpur.',
            body: `<p>Welcome to Nagpur Estates editorial documentation. This comprehensive resource covers market dynamics, civic infrastructure expansions (including Nagpur Metro Phase II and MIHAN SEZ developments), and curated architectural insights.</p><p>For personalized property advisory or investment consultation, reach out to our concierge desk at Civil Lines, Nagpur.</p>`
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticle();
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-light py-12 md:py-20">
      <Helmet>
        <title>{content?.title ? `${content.title} | Nagpur Estates` : 'Article | Nagpur Estates'}</title>
        <meta name="description" content={content?.excerpt || 'Editorial publication by Nagpur Estates.'} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-xs uppercase tracking-luxury text-charcoal-muted hover:text-navy transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Editorial Article Header */}
        <article className="bg-white border border-beige p-8 md:p-14 shadow-subtle">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-luxury text-gold border border-gold/40 px-3 py-1 bg-ivory">
              {content?.category || 'ARTICLE'}
            </span>
            <span className="text-xs text-charcoal-muted flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {content?.publishedAt ? new Date(content.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '2026'}
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-5xl text-navy leading-tight tracking-tight mb-6">
            {content?.title}
          </h1>

          {content?.excerpt && (
            <p className="text-base md:text-lg text-charcoal-light leading-relaxed border-l-2 border-gold pl-4 py-1 mb-8 italic">
              {content.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between py-4 border-y border-beige text-xs text-charcoal-muted mb-10">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gold" />
              <span className="font-medium text-navy">{content?.author || 'Nagpur Estates Editorial Desk'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1 text-gold" />
                {content?.readTime || '5 min read'}
              </span>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: content?.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Article link copied to clipboard.');
                  }
                }}
                className="hover:text-navy transition-colors inline-flex items-center"
                title="Share Article"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </button>
            </div>
          </div>

          {/* Editorial Content Prose */}
          <div
            className="prose prose-slate max-w-none text-charcoal leading-relaxed font-sans space-y-6 text-sm md:text-base [&>h3]:font-serif [&>h3]:text-2xl [&>h3]:text-navy [&>h3]:font-normal [&>h3]:mt-8 [&>h3]:mb-3 [&>p]:leading-relaxed [&>p]:text-charcoal-light"
            dangerouslySetInnerHTML={{ __html: content?.body || '' }}
          />

          {/* MahaRERA Compliance Assurance Notice */}
          <div className="mt-12 p-6 bg-ivory border border-beige flex items-start space-x-4">
            <CheckCircle2 className="w-6 h-6 text-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif text-base text-navy font-semibold mb-1">MahaRERA Advisory Note</h4>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Nagpur Estates strictly enforces Maharashtra Real Estate Regulatory Authority standards. Buyers are encouraged to independently verify project registrations at maharera.mahaonline.gov.in.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ContentDetailsPage;

