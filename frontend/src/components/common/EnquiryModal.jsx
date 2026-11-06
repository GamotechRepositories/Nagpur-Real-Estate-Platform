import React, { useState } from 'react';
import { X, Send, Phone, User, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';

const EnquiryModal = ({ isOpen, onClose, property }) => {
  const { user } = useAuthStore();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('I am inquiring regarding acquisition details, documentation, and viewing arrangements for this residence.');
  const [budget, setBudget] = useState(property?.price || '');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !property) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please provide a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/enquiries', {
        customerName,
        phoneNumber: cleanPhone,
        email: email || undefined,
        propertyId: property._id,
        message,
        budget: Number(budget) || property.price,
        locality: property.localityName,
        leadSource: 'PROPERTY_ENQUIRY',
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm">
      <div className="bg-white max-w-lg w-full border border-beige shadow-card relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-charcoal-muted hover:text-navy transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="mb-6">
            <span className="text-[10px] font-semibold uppercase tracking-luxury text-gold border border-gold/40 px-2.5 py-0.5 bg-ivory">
              Private Advisory Direct
            </span>
            <h3 className="font-serif text-2xl text-navy font-normal mt-2">
              Inquire Concerning Asset
            </h3>
            <p className="text-xs text-charcoal-muted mt-1 line-clamp-1 font-sans">
              Regarding: <strong className="text-navy">{property.title}</strong>
            </p>
          </div>

          {success ? (
            <div className="py-10 text-center space-y-3 bg-ivory border border-beige p-6">
              <div className="w-12 h-12 border border-gold text-gold flex items-center justify-center mx-auto bg-white">
                <CheckCircle className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="font-serif text-xl text-navy">Inquiry Dispatched</h4>
              <p className="text-xs text-charcoal-muted max-w-xs mx-auto font-sans leading-relaxed">
                The certified concierge desk will contact you via phone and WhatsApp regarding {property.localityName}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Deshmukh"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                    Phone (10 Digits)
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9823000000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted mb-1 font-medium">
                  Advisory Note / Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-beige bg-ivory-light text-navy text-xs focus:outline-none focus:border-gold transition-colors font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy hover:bg-navy-light text-white text-xs font-medium tracking-luxury uppercase py-3.5 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-gold" />
                <span>{loading ? 'Transmitting...' : 'Dispatch Confidential Inquiry'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnquiryModal;
