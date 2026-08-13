import { Link } from 'react-router-dom';
import { Search, ChevronRight, Home, HelpCircle, MessageSquare, Truck, RotateCcw, ShieldCheck, CreditCard, Package } from 'lucide-react';

const FAQ = [
  { q: 'How do I track my order?', a: 'Go to My Orders, find your order, and click "Track" to see real-time delivery status.' },
  { q: 'What is the return policy?', a: 'You can return most items within 30 days of delivery for a full refund, as long as they are in original condition.' },
  { q: 'When will I get my refund?', a: 'Refunds are processed within 3-5 business days after we receive the returned item.' },
  { q: 'How do I contact a seller?', a: 'Go to Messages in your account, select the seller conversation, and send a message directly.' },
  { q: 'Is my payment secure?', a: 'Yes, all payments are encrypted and processed through secure payment gateways with buyer protection.' },
  { q: 'Can I change my shipping address after ordering?', a: 'You can change the address before the order is shipped. Contact support immediately if you need to update it.' },
];

const TOPICS = [
  { icon: Package, title: 'Orders & Tracking', desc: 'Track, modify, or cancel orders' },
  { icon: RotateCcw, title: 'Returns & Refunds', desc: 'Return policy and refund process' },
  { icon: Truck, title: 'Shipping', desc: 'Delivery times and costs' },
  { icon: CreditCard, title: 'Payments', desc: 'Payment methods and security' },
  { icon: ShieldCheck, title: 'Buyer Protection', desc: 'How you are protected' },
  { icon: MessageSquare, title: 'Contact Support', desc: 'Get help from our team' },
];

export function HelpCenterPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="flex items-center gap-1 hover:text-ink-900"><Home className="h-3.5 w-3.5" /> Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-ink-900">Help Center</span>
      </nav>

      {/* Hero */}
      <div className="mt-6 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-8 text-center text-white">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold">How can we help you?</h1>
        <p className="mt-2 text-white/80">Search our help center or browse topics below</p>
        <div className="mx-auto mt-6 max-w-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input placeholder="Search for help..." className="w-full rounded-xl border-0 bg-white py-3.5 pl-12 pr-4 text-sm text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-white/50" />
          </div>
        </div>
      </div>

      {/* Topics */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {TOPICS.map(t => (
          <button key={t.title} className="group flex flex-col items-start gap-2 rounded-2xl border border-ink-100 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
              <t.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-ink-900">{t.title}</p>
            <p className="text-xs text-ink-500">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-ink-900">Frequently asked questions</h2>
        <div className="mt-4 space-y-2">
          {FAQ.map((item, i) => (
            <details key={i} className="group rounded-2xl border border-ink-100 bg-white p-4 [&_summary]:cursor-pointer">
              <summary className="flex items-center justify-between text-sm font-medium text-ink-900">
                {item.q}
                <ChevronRight className="h-4 w-4 text-ink-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-ink-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-brand-600" />
          <h3 className="mt-3 font-semibold text-ink-900">Live chat</h3>
          <p className="text-sm text-ink-500">Chat with our support team</p>
          <button className="mt-4 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">Start chat</button>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-6 text-center">
          <HelpCircle className="mx-auto h-8 w-8 text-brand-600" />
          <h3 className="mt-3 font-semibold text-ink-900">Email support</h3>
          <p className="text-sm text-ink-500">support@shophub.com</p>
          <button className="mt-4 rounded-xl border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">Send email</button>
        </div>
      </div>
    </div>
  );
}
