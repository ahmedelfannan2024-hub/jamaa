/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SaleItem, PricingBasis, CustomerQuickLink, ProductQuickLink } from '../types';
import { X, Save, Sparkles, UserPlus, FilePlus, Bookmark } from 'lucide-react';

interface SalesFormProps {
  onSave: (item: SaleItem) => void;
  onClose: () => void;
  editingItem: SaleItem | null;
  nextSerialNumber: number;
  customers: CustomerQuickLink[];
  products: ProductQuickLink[];
  onAddQuickCustomer: (name: string) => void;
  onAddQuickProduct: (desc: string, price: number, basis: PricingBasis) => void;
  currencySymbol: string;
}

export default function SalesForm({
  onSave,
  onClose,
  editingItem,
  nextSerialNumber,
  customers,
  products,
  onAddQuickCustomer,
  onAddQuickProduct,
  currencySymbol
}: SalesFormProps) {
  // Input states
  const [serialNumber, setSerialNumber] = useState<number>(nextSerialNumber);
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [customerName, setCustomerName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [weight, setWeight] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [pricingBasis, setPricingBasis] = useState<PricingBasis>(PricingBasis.BY_QUANTITY);
  const [total, setTotal] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Quick Directory additions
  const [showQuickCustomerForm, setShowQuickCustomerForm] = useState(false);
  const [newQuickCustName, setNewQuickCustName] = useState('');
  const [showQuickProdForm, setShowQuickProdForm] = useState(false);
  const [newQuickProdDesc, setNewQuickProdDesc] = useState('');
  const [newQuickProdPrice, setNewQuickProdPrice] = useState<number>(0);
  const [newQuickProdBasis, setNewQuickProdBasis] = useState<PricingBasis>(PricingBasis.BY_QUANTITY);

  // Sync state if editing
  useEffect(() => {
    if (editingItem) {
      setSerialNumber(editingItem.serialNumber);
      setDate(editingItem.date);
      setCustomerName(editingItem.customerName);
      setDescription(editingItem.description);
      setWeight(editingItem.weight);
      setQuantity(editingItem.quantity);
      setPrice(editingItem.price);
      setPricingBasis(editingItem.pricingBasis);
      setTotal(editingItem.total);
      setNotes(editingItem.notes || '');
    } else {
      setSerialNumber(nextSerialNumber);
      setDate(new Date().toISOString().substring(0, 10));
      setCustomerName('');
      setDescription('');
      setWeight(0);
      setQuantity(1);
      setPrice(0);
      setPricingBasis(PricingBasis.BY_QUANTITY);
      setTotal(0);
      setNotes('');
    }
  }, [editingItem, nextSerialNumber]);

  // Handle Automatic Total Calculations
  useEffect(() => {
    let calculatedTotal = 0;
    if (pricingBasis === PricingBasis.BY_WEIGHT) {
      calculatedTotal = weight * price;
    } else if (pricingBasis === PricingBasis.BY_QUANTITY) {
      calculatedTotal = quantity * price;
    } else if (pricingBasis === PricingBasis.FIXED) {
      calculatedTotal = price;
    }
    setTotal(Number(calculatedTotal.toFixed(2)));
  }, [weight, quantity, price, pricingBasis]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('الرجاء إدخال اسم العميل');
      return;
    }
    if (!description.trim()) {
      alert('الرجاء إدخال البيان الخاص بالصلة أو السلعة');
      return;
    }

    const savedItem: SaleItem = {
      id: editingItem ? editingItem.id : `sale-${Date.now()}`,
      serialNumber: Number(serialNumber),
      date,
      customerName: customerName.trim(),
      description: description.trim(),
      weight: Number(weight) || 0,
      quantity: Number(quantity) || 0,
      price: Number(price) || 0,
      pricingBasis,
      total,
      notes: notes.trim()
    };

    onSave(savedItem);
  };

  // Quick action: Choose customer from directory
  const handleSelectCustomer = (name: string) => {
    setCustomerName(name);
  };

  // Quick action: Choose product from directory
  const handleSelectProduct = (prod: ProductQuickLink) => {
    setDescription(prod.description);
    if (prod.defaultPrice !== undefined) {
      setPrice(prod.defaultPrice);
    }
    if (prod.defaultBasis !== undefined) {
      setPricingBasis(prod.defaultBasis);
    }
  };

  // Directory handlers
  const handleAddCustomerQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuickCustName.trim()) {
      onAddQuickCustomer(newQuickCustName.trim());
      setCustomerName(newQuickCustName.trim());
      setNewQuickCustName('');
      setShowQuickCustomerForm(false);
    }
  };

  const handleAddProductQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuickProdDesc.trim()) {
      onAddQuickProduct(newQuickProdDesc.trim(), newQuickProdPrice, newQuickProdBasis);
      setDescription(newQuickProdDesc.trim());
      setPrice(newQuickProdPrice);
      setPricingBasis(newQuickProdBasis);
      setNewQuickProdDesc('');
      setNewQuickProdPrice(0);
      setShowQuickProdForm(false);
    }
  };

  return (
    <div id="sales-form-overlay" className="fixed inset-0 z-50 bg-[#06080F]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      
      {/* Modal Container */}
      <div id="sales-form-modal" className="bg-[#0B0F19] rounded-2xl w-full max-w-4xl shadow-2xl border border-[#1E293B] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#06080F] text-white px-6 py-4 flex items-center justify-between border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg font-sans">
              {editingItem ? `تعديل قيد مبيعات مسلسل: #${editingItem.serialNumber}` : 'إضافة عملية مبيعات جديدة'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 px-2.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Shortcuts Section */}
          <div id="form-shortcuts" className="bg-[#131722] rounded-xl p-4 border border-[#1E293B] shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-[#242C3F] pb-2">
              <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
              <span>لوحة التعبئة السريعة والمختصرات المتاحة</span>
            </h4>
            
            {/* Customer Shortcuts */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">اختر العميل فوراً:</span>
                <button 
                  type="button" 
                  onClick={() => setShowQuickCustomerForm(!showQuickCustomerForm)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>إضافة عميل جديد للدليل</span>
                </button>
              </div>

              {showQuickCustomerForm && (
                <form onSubmit={handleAddCustomerQuick} className="flex gap-2 items-center bg-[#1A1E2D]/55 p-2 rounded-lg border border-indigo-900/40 mt-1">
                  <input
                    type="text"
                    required
                    placeholder="اسم العميل الجديد"
                    value={newQuickCustName}
                    onChange={(e) => setNewQuickCustName(e.target.value)}
                    className="bg-[#131722] border border-[#2E3A52] text-white text-xs px-2.5 py-1.5 rounded-md focus:outline-none focus:border-indigo-500 flex-1 font-sans"
                  />
                  <button type="submit" className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-md font-bold hover:bg-indigo-700 cursor-pointer">حفظ</button>
                  <button type="button" onClick={() => setShowQuickCustomerForm(false)} className="text-slate-400 text-xs px-2 py-1.5 hover:underline cursor-pointer">إلغاء</button>
                </form>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                {customers.map((cust) => (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => handleSelectCustomer(cust.name)}
                    className={`text-xs px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                      customerName === cust.name 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-[#181D2D] text-slate-300 border-[#2A3449] hover:bg-[#20273C] hover:text-white'
                    }`}
                  >
                    {cust.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Shortcuts */}
            <div className="space-y-1.5 pt-2 border-t border-[#242C3F] mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">اختر البيان / الصنف الشائع:</span>
                <button 
                  type="button" 
                  onClick={() => setShowQuickProdForm(!showQuickProdForm)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <FilePlus className="w-3 h-3" />
                  <span>إضافة صنف مسبق للدليل</span>
                </button>
              </div>

              {showQuickProdForm && (
                <form onSubmit={handleAddProductQuick} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-[#241F1A]/55 p-2.5 rounded-lg border border-amber-900/40 mt-1">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="اسم الصنف / البيان"
                      value={newQuickProdDesc}
                      onChange={(e) => setNewQuickProdDesc(e.target.value)}
                      className="bg-[#131722] border border-[#2E3A52] text-white text-xs px-2.5 py-1.5 rounded-md w-full focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      required
                      placeholder="السعر الافتراضي"
                      value={newQuickProdPrice || ''}
                      onChange={(e) => setNewQuickProdPrice(Number(e.target.value))}
                      className="bg-[#131722] border border-[#2E3A52] text-white text-xs px-2.5 py-1.5 rounded-md w-full focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex gap-1.5 justify-between">
                    <select
                      value={newQuickProdBasis}
                      onChange={(e) => setNewQuickProdBasis(e.target.value as PricingBasis)}
                      className="bg-[#131722] border border-[#2E3A52] text-white text-xs px-2 py-1.5 rounded-md flex-1 focus:outline-none focus:border-amber-500"
                    >
                      <option value={PricingBasis.BY_QUANTITY} className="bg-[#131722]">بالعدد</option>
                      <option value={PricingBasis.BY_WEIGHT} className="bg-[#131722]">بالوزن</option>
                      <option value={PricingBasis.FIXED} className="bg-[#131722]">ثابت</option>
                    </select>
                    <button type="submit" className="bg-amber-600 text-white text-xs px-3 py-1.5 rounded-md font-bold hover:bg-amber-700 cursor-pointer">حفظ</button>
                  </div>
                </form>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                {products.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleSelectProduct(prod)}
                    className={`text-xs px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                      description === prod.description 
                        ? 'bg-amber-600 text-white border-amber-600' 
                        : 'bg-[#181D2D] text-slate-300 border-[#2A3449] hover:bg-[#20273C] hover:text-white'
                    }`}
                  >
                    {prod.description} {prod.defaultPrice ? `(${prod.defaultPrice} ${currencySymbol})` : ''}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Form Fields React Form */}
          <form onSubmit={handleSubmit} className="bg-[#131722] rounded-xl p-6 border border-[#1E293B] shadow-lg space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Sl No */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">المسلسل (#)</label>
                <input
                  type="number"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(Number(e.target.value))}
                  className="w-full bg-[#181D2D] border border-[#2E3A52] text-white text-sm px-3.5 py-2 rounded-lg font-mono focus:bg-[#1E253A] focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">التاريخ</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#181D2D] border border-[#2E3A52] text-white text-sm px-3.5 py-2 rounded-lg font-mono focus:bg-[#1E253A] focus:outline-none focus:border-indigo-500 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">اسم العميل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة القدس للمقاولات"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#181D2D] border border-[#2E3A52] text-white text-sm px-3.5 py-2 rounded-lg focus:bg-[#1E253A] focus:outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Product Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">البيان (التفاصيل / اسم الصنف)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حديد تسليح تركي أصلي درجة أولى"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#181D2D] border border-[#2E3A52] text-white text-sm px-3.5 py-2 rounded-lg focus:bg-[#1E253A] focus:outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              {/* Pricing Basis Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">طريقة احتساب الإجمالي</label>
                <select
                  value={pricingBasis}
                  onChange={(e) => setPricingBasis(e.target.value as PricingBasis)}
                  className="w-full bg-[#181D2D] border border-[#2E3A52] text-white text-sm px-3.5 py-2 rounded-lg focus:bg-[#1E253A] focus:outline-none focus:border-indigo-500 transition-all font-sans animate-fade-in"
                >
                  <option value={PricingBasis.BY_QUANTITY} className="bg-[#131722]">الإجمالي = العدد × السعر</option>
                  <option value={PricingBasis.BY_WEIGHT} className="bg-[#131722]">الإجمالي = الوزن × السعر</option>
                  <option value={PricingBasis.FIXED} className="bg-[#131722]">الإجمالي = السعر ثابت (بدون ضرب)</option>
                </select>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#181D2D] p-4 rounded-xl border border-[#232B3D]">
              
              {/* Weight */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>الوزن</span>
                  {pricingBasis === PricingBasis.BY_WEIGHT && <span className="text-[10px] text-indigo-400 font-bold">(أساس الضرب)</span>}
                </label>
                <input
                  type="number"
                  step="any"
                  value={weight || ''}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  placeholder="0.00"
                  className={`w-full bg-[#131722] border border-[#2A3449] text-white text-sm px-3.5 py-2 rounded-lg font-mono focus:outline-none focus:border-indigo-500 ${
                    pricingBasis === PricingBasis.BY_WEIGHT ? 'ring-1.5 ring-indigo-500' : ''
                  }`}
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>العدد</span>
                  {pricingBasis === PricingBasis.BY_QUANTITY && <span className="text-[10px] text-amber-500 font-bold">(أساس الضرب)</span>}
                </label>
                <input
                  type="number"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="1"
                  className={`w-full bg-[#131722] border border-[#2A3449] text-white text-sm px-3.5 py-2 rounded-lg font-mono focus:outline-none focus:border-amber-500 ${
                    pricingBasis === PricingBasis.BY_QUANTITY ? 'ring-1.5 ring-amber-500' : ''
                  }`}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">السعر الفردي</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-[#131722] border border-[#2A3449] text-white text-sm px-3.5 py-2 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Calculated Total */}
              <div>
                <label className="block text-xs font-bold text-slate-350 mb-1.5">الإجمالي تلقائي</label>
                <div className="w-full bg-[#0E2F1F]/70 border border-[#185536] text-emerald-400 font-bold text-lg px-3.5 py-1.5 rounded-lg font-mono flex items-center justify-between">
                  <span>{total.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</span>
                  <span className="text-xs text-emerald-400 font-sans">{currencySymbol}</span>
                </div>
              </div>

            </div>

            {/* Notes Comments */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">الملاحظات</label>
              <textarea
                placeholder="أضف أي تفاصيل خاصة بالتوصيل، أسلوب الدفع، أو شروط الاستلام..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-[#181D2D] border border-[#2E3A52] text-white text-sm px-3.5 py-2 rounded-lg focus:bg-[#1E253A] focus:outline-none focus:border-indigo-500 transition-all font-sans"
              />
            </div>

            {/* Bottom Actions Row */}
            <div className="flex justify-end gap-3 pt-3 border-t border-[#242C3F]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-[#181D2D] text-slate-300 border border-[#2A3449] hover:bg-[#222A3F] text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                إلغاء وتراجع
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl active:scale-95 transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingItem ? 'حفظ التحديثات' : 'تسجيل القيد والترحيل'}</span>
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
