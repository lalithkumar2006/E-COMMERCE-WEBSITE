import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.submitContact(formData);
      addToast(res.message, 'success');
      setSubmitted(true);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Contact & Support</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Have an inquiry about an order, UPI payment verification, or product specs? Our concierge team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Customer Helpdesk</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Email Inquiries</p>
                  <p className="text-slate-500">support@aurastore.in &bull; orders@aurastore.in</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">Response within 2 hours</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Phone Support</p>
                  <p className="text-slate-500">+91 98401 23456 / +91 (044) 4892 1100</p>
                  <p className="text-[10px] text-slate-400">Mon - Sat, 9:00 AM - 8:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Merchant Office</p>
                  <p className="text-slate-500 leading-relaxed">
                    AuraStore Commerce Hub<br />
                    42, Gandhi Road, Anna Nagar West<br />
                    Chennai, Tamil Nadu 600040, India
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp CTA */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <a
                href="https://wa.me/919840123456?text=Hi%20AuraStore%20team,%20I%20have%20an%20order%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
              >
                <MessageSquare className="w-4 h-4" />
                Chat Instantly on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Message Dispatched!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you for reaching out. A senior customer support officer has received your request and will follow up shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Send us a Message</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Your Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Lalith Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Your Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98401 23456"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subject *</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      placeholder="Order Inquiry / UPI Settlement"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Message *</label>
                  <textarea
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    placeholder="Describe how we can assist you..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Sending...' : 'Transmit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
