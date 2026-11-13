import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function UPIPayment() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isAdmin } = useAuth();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [simulatingApproval, setSimulatingApproval] = useState(false);

  // Load UPI payload details
  const loadPaymentDetails = async () => {
    try {
      const res = await api.getUpiDetails(orderNumber);
      setDetails(res);
      if (res.paymentStatus === 'Verified') {
        navigate(`/order-confirmation/${orderNumber}`);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load order payment details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentDetails();

    // Poll payment status every 5 seconds until verified
    const interval = setInterval(async () => {
      try {
        const statusRes = await api.getPaymentStatus(orderNumber);
        if (statusRes.paymentStatus === 'Verified') {
          clearInterval(interval);
          addToast('Payment verified successfully!', 'success');
          navigate(`/order-confirmation/${orderNumber}`);
        }
      } catch (e) {}
    }, 5000);

    return () => clearInterval(interval);
  }, [orderNumber]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
      addToast('Merchant UPI ID copied to clipboard!', 'info');
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
      addToast('Order amount copied!', 'info');
    }
  };

  const handleSubmitUtr = async (e) => {
    e.preventDefault();
    const clean = utrNumber.trim().replace(/\s+/g, '');
    if (!clean) {
      addToast('Please enter your 12-digit UPI Reference Number / Bank UTR.', 'error');
      return;
    }

    if (!/^\d{12}$/.test(clean)) {
      addToast('UTR must be exactly 12 numeric digits (e.g. 432109876543).', 'error');
      return;
    }

    try {
      setSubmittingUtr(true);
      const res = await api.submitUtr(orderNumber, clean, notes);
      addToast(res.message, 'success');
      loadPaymentDetails();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingUtr(false);
    }
  };

  // Instant verification simulator for tests & demonstrations
  const handleSimulateInstantVerification = async () => {
    try {
      setSimulatingApproval(true);
      const res = await api.verifyPayment(orderNumber, 'approve');
      addToast('Payment approved via Server Verification!', 'success');
      navigate(`/order-confirmation/${orderNumber}`);
    } catch (err) {
      addToast(err.message || 'Verification error', 'error');
    } finally {
      setSimulatingApproval(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto"></div>
        <div className="w-48 h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl mx-auto"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold">Order Not Found</h2>
        <Link to="/" className="text-xs text-indigo-600 mt-4 block">Return Home</Link>
      </div>
    );
  }

  const isSubmitted = details.paymentStatus === 'Submitted';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>NPCI Direct UPI Gateway</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Complete Your UPI Payment
        </h1>
        <p className="text-xs text-slate-500">
          Order Reference: <strong className="text-slate-800 dark:text-slate-200 font-mono">{orderNumber}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Card: QR Code & Merchant Destination */}
        <div className="md:col-span-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
          
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Payable Amount</span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">
                ₹{Number(details.amount).toLocaleString('en-IN')}
              </span>
              <button
                onClick={() => copyToClipboard(details.amount.toString(), 'amount')}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {copiedAmount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Dynamic QR Code */}
          <div className="inline-block p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
            <img
              src={details.qrCodeDataUrl}
              alt="UPI Payment QR Code"
              className="w-56 h-56 mx-auto rounded-lg"
            />
            <p className="text-[11px] text-slate-500 font-semibold mt-2">
              Scan with any UPI App
            </p>
          </div>

          {/* Merchant Verified Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Merchant Name:</span>
              <strong className="text-xs text-slate-900 dark:text-white">{details.merchantName}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Merchant UPI ID:</span>
              <div className="flex items-center gap-1.5">
                <code className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {details.merchantUpiId}
                </code>
                <button
                  onClick={() => copyToClipboard(details.merchantUpiId, 'upi')}
                  className="p-1 text-slate-400 hover:text-indigo-600"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* UPI App Deep Links (for mobile/tablet) */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Or Open Directly in UPI App:</p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={details.deepLinks.gpay}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                Google Pay
              </a>
              <a
                href={details.deepLinks.phonepe}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                PhonePe
              </a>
              <a
                href={details.deepLinks.paytm}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                Paytm
              </a>
              <a
                href={details.deepLinks.bhim}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                BHIM UPI
              </a>
            </div>
          </div>
        </div>

        {/* Right Card: Step Instructions & UTR Submission */}
        <div className="md:col-span-6 space-y-6">
          
          {/* Status Alert */}
          {isSubmitted ? (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Payment Submitted for Verification</h4>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Submitted UTR: <strong className="font-mono">{details.existingPayment?.utr_number}</strong>. Our server and merchant settlement desk are validating your transaction reference. This page will automatically update once verified!
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">How to Complete Payment:</h4>
              <ol className="text-xs text-indigo-950 dark:text-indigo-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Scan the QR code or click one of the UPI buttons on the left.</li>
                <li>Verify merchant name is <strong>Lalithkumar</strong> (<code className="font-mono text-[11px]">lalithkumar19742006@oksbi</code>).</li>
                <li>Approve the transaction of <strong>₹{Number(details.amount).toLocaleString('en-IN')}</strong>.</li>
                <li>Copy the <strong>12-digit UTR / UPI Reference Number</strong> from your payment receipt and paste it below.</li>
              </ol>
            </div>
          )}

          {/* UTR Submission Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Payment Confirmation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Enter your 12-digit Bank UTR / UPI Transaction Reference</p>
            </div>

            <form onSubmit={handleSubmitUtr} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  12-Digit UPI Reference Number (UTR) *
                </label>
                <input
                  type="text"
                  maxLength="12"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 432109876543"
                  required
                  className="w-full px-3.5 py-3 rounded-xl text-sm font-mono tracking-wider bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 block">
                  Find this in your GPay / PhonePe / Paytm transaction receipt under "UPI transaction ID" or "UTR".
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notes / Remarks (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid via GPay from HDFC Bank"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingUtr || utrNumber.length !== 12}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submittingUtr ? 'Verifying with Bank...' : 'Confirm & Submit UTR'}
              </button>
            </form>

            {/* Instant verification tool for demonstrations & review */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Fast-Track Payment Verification:</span>
                <span className="text-[10px] uppercase font-bold text-indigo-600">Simulate Success</span>
              </div>
              <button
                type="button"
                onClick={handleSimulateInstantVerification}
                disabled={simulatingApproval}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                {simulatingApproval ? 'Verifying...' : 'One-Click Verify Payment & Finalize Order'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
