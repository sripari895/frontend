import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Truck, CreditCard, User, ShieldAlert } from 'lucide-react';

const faqs = [
  {
    category: 'Shipping & Tracking',
    icon: <Truck className="w-6 h-6 text-blue-600" />,
    questions: [
      { q: 'How can I track my shipment?', a: 'You can track your shipment using the tracking ID provided at the time of booking on our Tracking page.' },
      { q: 'What is the estimated delivery time?', a: 'Delivery times vary based on distance and service level. Local deliveries usually take 1-2 days, while national shipping can take 3-5 days.' },
    ],
  },
  {
    category: 'Payments & Billing',
    icon: <CreditCard className="w-6 h-6 text-green-600" />,
    questions: [
      { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, and net banking.' },
      { q: 'Can I get an invoice for my shipment?', a: 'Yes, invoices are automatically generated and sent to your registered email after payment.' },
    ],
  },
  {
    category: 'Account Settings',
    icon: <User className="w-6 h-6 text-purple-600" />,
    questions: [
      { q: 'How do I reset my password?', a: 'Go to the login page and click on "Forgot Password" to receive a reset link via email.' },
      { q: 'Can I change my pickup address?', a: 'You can update your default address in your account profile settings.' },
    ],
  },
  {
    category: 'Claims',
    icon: <ShieldAlert className="w-6 h-6 text-red-600" />,
    questions: [
      { q: 'What if my package is damaged?', a: 'Please file a claim through our Support Ticket system with photos of the damage within 24 hours of delivery.' },
      { q: 'How do I claim a refund for delays?', a: 'Refunds for service failures can be requested by submitting a ticket under the Billing category.' },
    ],
  },
];

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = useMemo(() => faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0), [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header & Search */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">How can we help you?</h1>
          <p className="text-lg text-slate-600 mb-8">Search our help center for answers to your questions.</p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for articles, shipping updates, or billing..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{category.category}</h2>
                </div>
                <ul className="space-y-4">
                  {category.questions.map((item, qIdx) => (
                    <li key={qIdx} className="group">
                      <details className="cursor-pointer">
                        <summary className="flex items-center justify-between text-slate-700 font-medium hover:text-blue-600 transition-colors list-none">
                          <span>{item.q}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                        </summary>
                        <p className="mt-3 text-slate-600 leading-relaxed pl-2 border-l-2 border-blue-100">
                          {item.a}
                        </p>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500 text-lg">No results found for "{searchTerm}". Try searching for something else or contact support.</p>
            </div>
          )}
        </div>

        {/* Contact Support CTA */}
        <div className="mt-16 bg-blue-600 rounded-3xl p-8 text-center text-white shadow-xl shadow-blue-200">
          <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
          <p className="text-blue-100 mb-6 font-medium">Our support team is available 24/7 to assist you with any issues.</p>
          <a
            href="/support"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-xl text-blue-600 bg-white hover:bg-blue-50 transition-colors shadow-sm"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
