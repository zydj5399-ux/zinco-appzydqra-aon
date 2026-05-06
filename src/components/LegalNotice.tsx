import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Scale, ScrollText } from 'lucide-react';

interface LegalNoticeProps {
  type: 'privacy' | 'tos';
  isOpen: boolean;
  onClose: () => void;
}

export default function LegalNotice({ type, isOpen, onClose }: LegalNoticeProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0d121b] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                {type === 'privacy' ? (
                  <ShieldCheck className="text-cyan-400" size={24} />
                ) : (
                  <Scale className="text-amber-400" size={24} />
                )}
                <h3 className="text-xl font-bold text-white">
                  {type === 'privacy' ? 'سياسة الخصوصية' : 'شروط الاستخدام'}
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} className="text-neutral-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar text-right" dir="rtl">
              <div className="space-y-6 text-neutral-300 leading-relaxed text-sm">
                {type === 'privacy' ? (
                  <>
                    <section className="space-y-2">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <ScrollText size={14} className="text-cyan-500" />
                        1. جمع البيانات
                      </h4>
                      <p>نقوم بجمع المعلومات اللازمة فقط لتشغيل حسابك وتأمين معاملاتك المالية، بما في ذلك اسمك وبريدك الإلكتروني وعنوان المحفظة الرقمية.</p>
                    </section>
                    <section className="space-y-2">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <ScrollText size={14} className="text-cyan-500" />
                        2. استخدام ملفات تعريف الارتباط (Cookies)
                      </h4>
                      <p>نستخدم ملفات تعريف الارتباط الأساسية لضمان عمل جلسة تسجيل الدخول وتوفير تجربة تداول سلسة وآمنة.</p>
                    </section>
                    <section className="space-y-2">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <ScrollText size={14} className="text-cyan-500" />
                        3. حماية البيانات
                      </h4>
                      <p>يتم تشفير جميع البيانات الحساسة ونقلها عبر بروتوكولات آمنة (SSL/TLS). نحن نلتزم بمعايير Google للأمان السحابي.</p>
                    </section>
                    <section className="space-y-2">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <ScrollText size={14} className="text-cyan-500" />
                        4. مزودي الخدمة
                      </h4>
                      <p>نستخدم خدمات Google Firebase و Google Identity لتوفير أعلى مستويات الأمان والمصداقية لمنصتنا.</p>
                    </section>
                  </>
                ) : (
                  <>
                    <section className="space-y-2">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <ScrollText size={14} className="text-amber-500" />
                        1. قبول الشروط
                      </h4>
                      <p>باستخدامك لمنصة "ZincoTrade AI"، فإنك توافق على الالتزام بشروط الاستخدام المذكورة هنا وكافة القوانين واللوائح المعمول بها في مجال التداول الرقمي.</p>
                    </section>
                    <section className="space-y-2">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <ScrollText size={14} className="text-amber-500" />
                        2. المسؤولية المالية
                      </h4>
                      <p>التداول ينطوي على مخاطر. المنصة توفر أدوات ذكاء اصطناعي للمساعدة في اتخاذ القرار، لكن المستخدم هو المسؤول الأول والأخير عن قراراته الاستثمارية.</p>
                    </section>
                    <section className="space-y-2">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <ScrollText size={14} className="text-amber-500" />
                        3. الحسابات والأمان
                      </h4>
                      <p>يجب على المستخدم الحفاظ على سرية معلومات حسابه وعدم مشاركتها مع أي جهة خارجية لضمان توافق المنصة مع معايير الأمان العالمية.</p>
                    </section>
                    <section className="space-y-2">
                      <h4 className="text-white font-bold flex items-center gap-2">
                        <ScrollText size={14} className="text-amber-500" />
                        4. التعديلات على الخدمة
                      </h4>
                      <p>نحتفظ بالحق في تعديل أو وقف الخدمة في أي وقت لضمان استقرار النظام وتحديث خوارزميات التداول.</p>
                    </section>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end">
              <button 
                onClick={onClose}
                className="px-8 py-2.5 bg-white text-black font-bold rounded-xl hover:brightness-90 transition-all active:scale-95"
              >
                أفهم وأوافق
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
