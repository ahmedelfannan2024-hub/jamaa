/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SaleItem } from '../types';
import { Printer, X, CheckCircle2, ShoppingCart, Calendar, User, FileText } from 'lucide-react';

interface PrintInvoiceProps {
  saleItem: SaleItem;
  onClose: () => void;
  currencySymbol: string;
}

export default function PrintInvoice({ saleItem, onClose, currencySymbol }: PrintInvoiceProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="print-overlay" className="fixed inset-0 z-50 bg-[#06080F]/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      
      {/* Container */}
      <div id="print-dialog" className="bg-[#131722] rounded-2xl w-full max-w-2xl shadow-2xl border border-[#1E293B] overflow-hidden no-print flex flex-col my-4">
        
        {/* Actions bar */}
        <div className="bg-[#06080F] text-white px-6 py-4 flex items-center justify-between border-b border-[#1E293B]">
          <span className="font-bold text-sm tracking-wide">معاينة وطباعة الفاتورة الرقمية</span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الآن (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Invoice to Print */}
        <div id="invoice-bill-document" className="p-10 text-slate-800 bg-white print-card flex-1">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">م</div>
                <h2 className="text-xl font-extrabold text-slate-900 font-sans">فاتورة مبيعات</h2>
              </div>
              <p className="text-xs text-slate-400">نظام إدارة ومتابعة حركة مبيعات المخازن والعملاء</p>
            </div>
            <div className="text-left space-y-1">
              <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100 mb-1">فاتورة مدفوعة ومرحّلة</span>
              <p className="text-xs text-slate-500 font-mono">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 my-6 py-4 px-5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">تاريخ الفاتورة:</span>
                <span className="font-bold text-slate-900 font-mono">{saleItem.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">رقم المسلسل (القيد):</span>
                <span className="font-bold text-indigo-600 font-mono">#{saleItem.serialNumber}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">المشتري / العميل:</span>
                <span className="font-bold text-slate-900">{saleItem.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">طريقة التسعير:</span>
                <span className="font-bold text-slate-900">
                  {saleItem.pricingBasis === 'weight' ? 'محتسب بالوزن' : saleItem.pricingBasis === 'quantity' ? 'محتسب بالعدد' : 'سعر مقطوع ثابت'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Item Table */}
          <div className="overflow-hidden border border-slate-200 rounded-xl mt-6">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3 text-center w-12">#</th>
                  <th className="p-3">البيان (اسم الصنف والشرح)</th>
                  <th className="p-3 text-center">الوزن</th>
                  <th className="p-3 text-center">العدد</th>
                  <th className="p-3 text-left">السعر الفردي</th>
                  <th className="p-3 text-left bg-indigo-50/50 text-indigo-950 font-extrabold">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                <tr className="text-slate-900">
                  <td className="p-4 text-center font-bold text-slate-400 font-mono">1</td>
                  <td className="p-4 font-bold">{saleItem.description}</td>
                  <td className="p-4 text-center font-mono">{saleItem.weight && saleItem.weight > 0 ? `${saleItem.weight.toLocaleString('ar-EG')} كجم` : '—'}</td>
                  <td className="p-4 text-center font-mono">{saleItem.quantity && saleItem.quantity > 0 ? `${saleItem.quantity.toLocaleString('ar-EG')} وحدة` : '—'}</td>
                  <td className="p-4 text-left font-mono">{saleItem.price.toLocaleString('ar-EG')} {currencySymbol}</td>
                  <td className="p-4 text-left bg-indigo-50/30 text-indigo-950 font-extrabold font-mono text-sm">
                    {saleItem.total.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} {currencySymbol}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bill Notes */}
          {saleItem.notes && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="font-bold text-slate-700 block mb-1">ملاحظات الفاتورة والتسليم:</span>
              <p className="text-slate-600 leading-relaxed">{saleItem.notes}</p>
            </div>
          )}

          {/* Value in text (Tafqeet simulation) */}
          <div className="mt-4 text-left">
            <span className="text-[10px] text-slate-400 block">المبلغ المرقوم كتابةً:</span>
            <span className="text-xs font-bold text-slate-600">فقط وقدره {saleItem.total.toLocaleString('ar-EG')} {currencySymbol} لا غير.</span>
          </div>

          {/* Signature Sections */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-dashed border-slate-200 text-center text-xs">
            <div className="space-y-8">
              <span className="font-bold text-slate-600 block">مستلم البضاعة (العميل)</span>
              <div className="w-32 border-b border-slate-350 mx-auto" />
              <span className="text-[10px] text-slate-400 font-medium">الاسم والتوقيع</span>
            </div>
            <div className="space-y-8">
              <span className="font-bold text-slate-600 block">أمين المستودع (شحن)</span>
              <div className="w-32 border-b border-slate-350 mx-auto" />
              <span className="text-[10px] text-slate-400 font-medium">التوقيع والختم</span>
            </div>
            <div className="space-y-8">
              <span className="font-bold text-slate-600 block">المبيعات والمحاسبة</span>
              <div className="w-32 border-b border-slate-350 mx-auto" />
              <span className="text-[10px] text-slate-400 font-medium">الموظف المسؤول</span>
            </div>
          </div>

          {/* Footer branding */}
          <div className="mt-14 pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400">برنامج مبيعات متكامل - تم حفظ البيانات وتأكيدها رقمياً بنجاح</p>
          </div>

        </div>

        {/* Print view only layout (Hidden in screen browser) */}
        <div className="hidden print-only text-center mt-4">
          <p className="text-[10px] text-slate-300">طُبعت من خلال برنامج المبيعات والLedger الرقمي</p>
        </div>

      </div>

    </div>
  );
}
