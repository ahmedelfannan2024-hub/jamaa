/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SaleItem, PricingBasis, CustomerQuickLink, ProductQuickLink } from './types';
import { INITIAL_CUSTOMERS, INITIAL_PRODUCTS, INITIAL_SALES } from './initialData';
import StatsDashboard from './components/StatsDashboard';
import SalesForm from './components/SalesForm';
import PrintInvoice from './components/PrintInvoice';
import LoginScreen from './components/LoginScreen';

import {
  Plus,
  Search,
  Trash2,
  Edit,
  Printer,
  Download,
  Upload,
  Calendar,
  DollarSign,
  Filter,
  Settings,
  Layers,
  RefreshCw,
  Database,
  ArrowUpDown,
  Check,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  FileText,
  LogOut
} from 'lucide-react';

export default function App() {
  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const localAuth = localStorage.getItem('sales_tracker_logged_in') === 'true';
    const sessionAuth = sessionStorage.getItem('sales_tracker_logged_in') === 'true';
    return localAuth || sessionAuth;
  });

  const handleLoginSuccess = (rememberMe: boolean) => {
    setIsAuthenticated(true);
    if (rememberMe) {
      localStorage.setItem('sales_tracker_logged_in', 'true');
    } else {
      sessionStorage.setItem('sales_tracker_logged_in', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('sales_tracker_logged_in');
    sessionStorage.removeItem('sales_tracker_logged_in');
  };

  // --- STATE PERSISTENCE ---
  const [sales, setSales] = useState<SaleItem[]>(() => {
    const isCleaned = localStorage.getItem('sales_tracker_cleaned_v2') === 'true';
    if (!isCleaned) {
      localStorage.removeItem('sales_tracker_entries');
    }
    const saved = localStorage.getItem('sales_tracker_entries');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [customers, setCustomers] = useState<CustomerQuickLink[]>(() => {
    const isCleaned = localStorage.getItem('sales_tracker_cleaned_v2') === 'true';
    if (!isCleaned) {
      localStorage.removeItem('sales_tracker_customers');
    }
    const saved = localStorage.getItem('sales_tracker_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [products, setProducts] = useState<ProductQuickLink[]>(() => {
    const isCleaned = localStorage.getItem('sales_tracker_cleaned_v2') === 'true';
    if (!isCleaned) {
      localStorage.removeItem('sales_tracker_products');
    }
    const saved = localStorage.getItem('sales_tracker_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Force clean flag save
  useEffect(() => {
    localStorage.setItem('sales_tracker_cleaned_v2', 'true');
  }, []);

  const [storeName, setStoreName] = useState<string>(() => {
    const saved = localStorage.getItem('sales_tracker_store_name');
    if (!saved || saved === 'مؤسسة التوريدات والخدمات العامة') {
      return 'المصرية الدولية لصناعة عبوات الجامبو';
    }
    return saved;
  });

  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    const saved = localStorage.getItem('sales_tracker_currency');
    if (!saved || saved === 'ر.س') {
      return 'ج.م';
    }
    return saved;
  });

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('sales_tracker_entries', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('sales_tracker_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('sales_tracker_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sales_tracker_store_name', storeName);
  }, [storeName]);

  useEffect(() => {
    localStorage.setItem('sales_tracker_currency', currencySymbol);
  }, [currencySymbol]);

  // --- UI TABS & FILTERS STATE ---
  const [activeTab, setActiveTab] = useState<'ledger' | 'dashboard' | 'directories'>('ledger');
  const [searchQuery, setSearchQuery] = useState('');
  const [basisFilter, setBasisFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- MODAL & ACTION STATES ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SaleItem | null>(null);
  const [printingItem, setPrintingItem] = useState<SaleItem | null>(null);

  // --- SORTING STATE ---
  const [sortField, setSortField] = useState<keyof SaleItem>('serialNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Backup Import/Export Text State
  const [backupString, setBackupString] = useState('');
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Generate Backup JSON string whenever database changes
  useEffect(() => {
    const fullBackup = {
      sales,
      customers,
      products,
      storeName,
      currencySymbol,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
    setBackupString(JSON.stringify(fullBackup, null, 2));
  }, [sales, customers, products, storeName, currencySymbol]);

  // --- UTILS & DIRECTORIES MUTATIONS ---
  const handleAddQuickCustomer = (name: string) => {
    const newCust: CustomerQuickLink = {
      id: `cust-${Date.now()}`,
      name
    };
    setCustomers(prev => [...prev, newCust]);
  };

  const handleAddQuickProduct = (desc: string, price: number, basis: PricingBasis) => {
    const newProd: ProductQuickLink = {
      id: `prod-${Date.now()}`,
      description: desc,
      defaultPrice: price,
      defaultBasis: basis
    };
    setProducts(prev => [...prev, newProd]);
  };

  const handleDeleteQuickCustomer = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل من قائمة الاختصارات السريعة؟')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleDeleteQuickProduct = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف من قائمة الاختصارات السريعة؟')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // --- MAIN RECORD ACTIONS ---
  const handleSaveSaleItem = (item: SaleItem) => {
    if (editingItem) {
      // Update existing item
      setSales(prev => prev.map(s => s.id === item.id ? item : s));
    } else {
      // Create new item
      setSales(prev => [...prev, item]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleEditClick = (item: SaleItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string, serial: number) => {
    if (confirm(`هل أنت متأكد من حذف عملية المبيعات مسلسل #${serial} نهائياً؟`)) {
      setSales(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleResetToDemo = () => {
    if (confirm('تحذير: سيتم مسح كافة البيانات الحالية وتصفير البرنامج تماماً للبدء من جديد! هل تريد الاستمرار؟')) {
      setSales(INITIAL_SALES);
      setCustomers(INITIAL_CUSTOMERS);
      setProducts(INITIAL_PRODUCTS);
      setStoreName('المصرية الدولية لصناعة عبوات الجامبو');
      setCurrencySymbol('ج.م');
    }
  };

  // Calculate the next mathematical serial number (Max serial + 1)
  const nextSerialNumber = useMemo(() => {
    if (sales.length === 0) return 1;
    const maxSerial = Math.max(...sales.map(s => s.serialNumber));
    return maxSerial + 1;
  }, [sales]);

  // --- FILTERING & SEARCHING LEDGER LOGIC ---
  const filteredSales = useMemo(() => {
    return sales.filter(item => {
      // 1. Text Search query (Customer Name, Description, Notes)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.customerName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      // 2. Pricing Basis Filter
      const matchesBasis = basisFilter === 'all' || item.pricingBasis === basisFilter;

      // 3. Date Range Filter
      const itemTime = new Date(item.date).getTime();
      const matchesStartDate = !startDate || itemTime >= new Date(startDate).getTime();
      const matchesEndDate = !endDate || itemTime <= new Date(endDate).getTime();

      return matchesSearch && matchesBasis && matchesStartDate && matchesEndDate;
    });
  }, [sales, searchQuery, basisFilter, startDate, endDate]);

  // --- SORTING LOGIC ---
  const sortedAndFilteredSales = useMemo(() => {
    const list = [...filteredSales];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle null cases or undefined
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB, 'ar', { sensitivity: 'base' })
          : valB.localeCompare(valA, 'ar', { sensitivity: 'base' });
      }

      // Numbers or others
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredSales, sortField, sortDirection]);

  // Toggle sorting column
  const handleSort = (field: keyof SaleItem) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // --- SUMMARY OF FILTERED ENTRIES ---
  const filteredMetrics = useMemo(() => {
    let salesSum = 0;
    let weightSum = 0;
    let quantitySum = 0;
    sortedAndFilteredSales.forEach(item => {
      salesSum += item.total;
      weightSum += item.weight;
      quantitySum += item.quantity;
    });
    return {
      totalSales: salesSum,
      totalWeight: weightSum,
      totalQuantity: quantitySum,
      count: sortedAndFilteredSales.length
    };
  }, [sortedAndFilteredSales]);

  // --- CSV / EXCEL EXPORT ---
  const exportToCSV = () => {
    // Columns: مسلسل ، التاريخ ، اسم العميل ، البيان ، طريقة احتساب الإجمالي ، الوزن ، العدد ، السعر ، الإجمالي ، الملاحظات
    const headers = ['مسلسل', 'التاريخ', 'اسم العميل', 'البيان', 'طريقة الاحتساب', 'الوزن (كجم)', 'العدد', 'السعر', 'الإجمالي', 'الملاحظات'];
    const rows = sortedAndFilteredSales.map(item => [
      item.serialNumber,
      item.date,
      item.customerName,
      item.description,
      item.pricingBasis === 'weight' ? 'بالوزن' : item.pricingBasis === 'quantity' ? 'بالعدد' : 'ثابت',
      item.weight,
      item.quantity,
      item.price,
      item.total,
      item.notes || ''
    ]);

    // Construct CSV text with correct Arabic UTF-8 BOM
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `كشف_مبيعات_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- BACKUP RESTORE (IMPORT JSON) ---
  const handleImportBackup = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(backupString);
      if (parsed.sales && Array.isArray(parsed.sales)) {
        setSales(parsed.sales);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.storeName) setStoreName(parsed.storeName);
        if (parsed.currencySymbol) setCurrencySymbol(parsed.currencySymbol);
        
        setBackupStatus({ type: 'success', message: 'تم استرداد قاعدة البيانات واستعادة النسخة الاحتياطية بنجاح!' });
        setTimeout(() => setBackupStatus(null), 5000);
      } else {
        throw new Error('تفتقد النسخة لبنية المبيعات البرمجية الصحيحة.');
      }
    } catch (err: any) {
      setBackupStatus({ type: 'error', message: `فشل استيراد النسخة الاحتياطية: ${err.message || 'كود الـ JSON غير صالح'}` });
      setTimeout(() => setBackupStatus(null), 5000);
    }
  };

  // Quick Action to print the entire filtered report index
  const handlePrintLedgerSummary = () => {
    window.print();
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] flex flex-col antialiased font-sans" dir="rtl">
      
      {/* Universal Top Header (Hidden in Print Mode) */}
      <header className="bg-[#090D16] border-b border-[#1E293B] text-white shadow-xl no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Institution Brand logo & Clock */}
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight font-sans text-white">دفتر المبيعات والحركة الرقمي</h1>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block animate-pulse"></span>
                  <span>{storeName}</span>
                </p>
              </div>
            </div>

            {/* Tab navigation selectors and logout */}
            <div className="flex items-center gap-3">
              <nav className="flex items-center gap-1.5 bg-[#05070C] p-1 rounded-xl border border-[#1E293B]">
                <button
                  onClick={() => setActiveTab('ledger')}
                  className={`px-4.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'ledger' 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>حركة المبيعات</span>
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'dashboard' 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>الإحصائيات والتحليلات</span>
                </button>
                <button
                  onClick={() => setActiveTab('directories')}
                  className={`px-4.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'directories' 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>الدليل والتهيئة</span>
                </button>
              </nav>

              <button
                onClick={handleLogout}
                className="p-2.5 bg-[#181D2D] hover:bg-[#252E47] border border-[#2E3A52] text-rose-400 hover:text-rose-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="تسجيل الخروج من النظام"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Workspace viewport */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6">

        {/* --- TAB 1: SALES LEDGER TAB --- */}
        {activeTab === 'ledger' && (
          <div className="space-y-6 flex-1 flex flex-col">
            
            {/* Grid display filters panel (no-print) */}
            <div className="bg-[#131722] rounded-2xl p-5 border border-[#1E293B] shadow-xl space-y-4 no-print">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-200">
                  <Filter className="w-4 h-4 text-indigo-400" />
                  <span>عوامل التصفية والبحث في القيود</span>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setBasisFilter('all');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-xs text-slate-400 hover:text-indigo-400 font-bold transition-colors cursor-pointer"
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>

              {/* Filtering Controls Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Search Text input */}
                <div className="relative md:col-span-1.5">
                  <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم العميل، البيان، أو الملاحظة..."
                    className="w-full bg-[#181D2D] border border-[#2E3A52] text-white placeholder-slate-500 text-xs px-10 py-2.5 rounded-xl block focus:bg-[#1C2235] focus:outline-none focus:border-indigo-500 transition-all font-sans"
                  />
                </div>

                {/* Pricing Basis selection */}
                <div>
                  <select
                    value={basisFilter}
                    onChange={(e) => setBasisFilter(e.target.value)}
                    className="w-full bg-[#181D2D] border border-[#2E3A52] text-white text-xs px-3.5 py-2.5 rounded-xl block focus:bg-[#1C2235] focus:outline-none focus:border-indigo-500 transition-all font-sans"
                  >
                    <option value="all" className="bg-[#131722]">كافة طرق احتساب السعر</option>
                    <option value="weight" className="bg-[#131722]">مبيعات بالوزن فقط</option>
                    <option value="quantity" className="bg-[#131722]">مبيعات بالعدد فقط</option>
                    <option value="fixed" className="bg-[#131722]">مبيعات بسعر ثابت فقط</option>
                  </select>
                </div>

                {/* Date range pickers */}
                <div className="md:col-span-1.5 flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      title="تاريخ البداية"
                      className="w-full bg-[#181D2D] border border-[#2E3A52] text-white text-xs px-3 py-2 rounded-xl focus:bg-[#1C2235] focus:outline-none focus:border-indigo-500 font-mono transition-all [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-bold">إلى</span>
                  <div className="flex-1">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      title="تاريخ النهاية"
                      className="w-full bg-[#181D2D] border border-[#2E3A52] text-white text-xs px-3 py-2 rounded-xl focus:bg-[#1C2235] focus:outline-none focus:border-indigo-500 font-mono transition-all [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Summation Quick stats ribbon (Excel auto-sum of filter) */}
            <div id="filter-ribbon" className="bg-gradient-to-r from-[#161B29] to-[#0F121C] p-4 rounded-xl border border-[#20293C] flex flex-wrap items-center justify-between gap-4 shadow-lg no-print">
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-indigo-650 text-white rounded-full px-2.5 py-0.5 font-bold font-mono no-print">
                  {filteredMetrics.count} / {sales.length}
                </span>
                <span className="text-xs font-bold text-slate-200">حركة المبيعات الملحوظة ضمن الفلترة الحالية</span>
              </div>

              {/* Counters */}
              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300">
                <div className="bg-[#1C2234] px-3.5 py-1.5 rounded-lg border border-[#2B354C] font-serif">
                  <span className="text-slate-400 text-[10px] block font-sans">إجمالي الإيراد المصحوب</span>
                  <strong className="text-emerald-400 text-sm font-sans font-bold">{filteredMetrics.totalSales.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  <span className="text-[10px] text-slate-400 mr-1 font-sans font-bold">{currencySymbol}</span>
                </div>

                <div className="bg-[#1C2234] px-3.5 py-1.5 rounded-lg border border-[#2B354C] font-serif">
                  <span className="text-slate-400 text-[10px] block font-sans">إجمالي الوزن المصحوب</span>
                  <strong className="text-indigo-400 text-sm font-sans font-bold">{filteredMetrics.totalWeight.toLocaleString('ar-EG', { maximumFractionDigits: 2 })}</strong>
                  <span className="text-[10px] text-slate-400 mr-1 font-sans">كجم</span>
                </div>

                <div className="bg-[#1C2234] px-3.5 py-1.5 rounded-lg border border-[#2B354C] font-serif">
                  <span className="text-slate-400 text-[10px] block font-sans">إجمالي الكمية (العدد)</span>
                  <strong className="text-amber-400 text-sm font-sans font-bold">{filteredMetrics.totalQuantity.toLocaleString('ar-EG')}</strong>
                  <span className="text-[10px] text-slate-400 mr-1 font-sans">وحدة</span>
                </div>
              </div>

              {/* Utility Bulk Actions */}
              <div className="flex gap-2 flex-shrink-0 no-print">
                <button
                  onClick={exportToCSV}
                  disabled={sortedAndFilteredSales.length === 0}
                  className="bg-[#181D2D] border border-[#2A3449] hover:bg-[#22293F] text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
                  title="تصدير النتائج إلى ملف إكسل ملون"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>تصدير Excel (CSV)</span>
                </button>
                <button
                  onClick={handlePrintLedgerSummary}
                  disabled={sortedAndFilteredSales.length === 0}
                  className="bg-[#181D2D] border border-[#2A3449] hover:bg-[#22293F] text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
                  title="طباعة كشف جدول البيانات الحالي"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-400" />
                  <span>طباعة الكشف</span>
                </button>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsFormOpen(true);
                  }}
                  className="bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-650/15 px-4.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 animate-bounce" />
                  <span>إدخال فاتورة / حركة جديدة</span>
                </button>
              </div>
            </div>

            {/* Real Printable Document Container Wrapper */}
            <div className="bg-[#131722] rounded-2xl border border-[#1E293B] shadow-xl overflow-hidden flex-1 flex flex-col print-card">
              
              {/* Show Store Logo / Sign ONLY in Printable view of the entire PDF structure */}
              <div className="hidden print-only p-6 border-b border-slate-200 mb-6 text-center space-y-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{storeName}</h1>
                <p className="text-xs text-slate-500">كشف مبيعات مفصّل بتاريخ {new Date().toLocaleDateString('ar-EG')}</p>
                {searchQuery && <p className="text-xs text-slate-400">مصفى بكلمة البحث: {searchQuery}</p>}
                <div className="grid grid-cols-3 gap-4 text-slate-700 text-xs pt-4 max-w-lg mx-auto text-right">
                  <div>إجمالي المبيعات: <strong>{filteredMetrics.totalSales.toLocaleString()} {currencySymbol}</strong></div>
                  <div>إجمالي الوزن: <strong>{filteredMetrics.totalWeight.toLocaleString()} كجم</strong></div>
                  <div>إجمالي الأعداد: <strong>{filteredMetrics.totalQuantity.toLocaleString()} قطعة</strong></div>
                </div>
              </div>

              {/* The Data Table */}
              <div className="overflow-x-auto w-full flex-1">
                {sortedAndFilteredSales.length === 0 ? (
                  <div className="py-24 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-800">لا توجد عمليات مبيعات مطابقة</h3>
                      <p className="text-xs text-slate-400">جرّب مراجعة نصوص البحث أو الفلترة الزمنية، أو اضغط على إدخال قيد جديد للبدء لتوليد البيانات.</p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setBasisFilter('all');
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-1.5 rounded-lg text-xs font-bold transition-all no-print cursor-pointer"
                    >
                      تنظيف جميع المرشحات
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#1A2030] border-b border-[#28324D] text-[#94A3B8] font-bold uppercase transition-all select-none">
                        <th onClick={() => handleSort('serialNumber')} className="p-3.5 text-center cursor-pointer hover:bg-[#242E47] transition-colors w-14">
                          <div className="flex items-center justify-center gap-1">
                            <span>مسلسل</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500 no-print" />
                          </div>
                        </th>
                        <th onClick={() => handleSort('date')} className="p-3.5 cursor-pointer hover:bg-[#242E47] transition-colors w-24">
                          <div className="flex items-center gap-1">
                            <span>التاريخ</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500 no-print" />
                          </div>
                        </th>
                        <th onClick={() => handleSort('customerName')} className="p-3.5 cursor-pointer hover:bg-[#242E47] transition-colors font-medium">
                          <div className="flex items-center gap-1">
                            <span>اسم العميل</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500 no-print" />
                          </div>
                        </th>
                        <th onClick={() => handleSort('description')} className="p-3.5 cursor-pointer hover:bg-[#242E47] transition-colors font-medium w-64">
                          <div className="flex items-center gap-1">
                            <span>البيان (التفاصيل)</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500 no-print" />
                          </div>
                        </th>
                        <th className="p-3.5 text-center w-24">طريقة التسعير</th>
                        <th onClick={() => handleSort('weight')} className="p-3.5 text-center cursor-pointer hover:bg-[#242E47] transition-colors w-18">
                          <div className="flex items-center justify-center gap-1">
                            <span>الوزن</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500 no-print" />
                          </div>
                        </th>
                        <th onClick={() => handleSort('quantity')} className="p-3.5 text-center cursor-pointer hover:bg-[#242E47] transition-colors w-18">
                          <div className="flex items-center justify-center gap-1">
                            <span>العدد</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500 no-print" />
                          </div>
                        </th>
                        <th onClick={() => handleSort('price')} className="p-3.5 text-left cursor-pointer hover:bg-[#242E47] transition-colors w-24">
                          <div className="flex items-center justify-start gap-1">
                            <span>السعر الفردي</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500 no-print" />
                          </div>
                        </th>
                        <th onClick={() => handleSort('total')} className="p-3.5 text-left cursor-pointer hover:bg-[#2C3854] text-indigo-200 font-extrabold w-28">
                          <div className="flex items-center justify-start gap-1">
                            <span>الإجمالي</span>
                            <ArrowUpDown className="w-3 h-3 text-indigo-400 no-print" />
                          </div>
                        </th>
                        <th className="p-3.5 font-medium max-w-xs truncate">الملاحظات</th>
                        <th className="p-3.5 text-center no-print w-36">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1D2435]">
                      {sortedAndFilteredSales.map((item, index) => (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-[#1E2538] transition-colors duration-100 text-slate-200 ${
                            index % 2 === 0 ? 'bg-[#131722]' : 'bg-[#161B29]'
                          }`}
                        >
                          {/* Seral Number */}
                          <td className="p-3.5 text-center font-bold text-[#8A9BB4] font-mono">
                            {item.serialNumber}
                          </td>

                          {/* Date */}
                          <td className="p-3.5 whitespace-nowrap text-[#91A2B9] font-mono font-medium">
                            {item.date}
                          </td>

                          {/* Customer Name */}
                          <td className="p-3.5 font-bold text-white whitespace-nowrap">
                            {item.customerName}
                          </td>

                          {/* Product Description */}
                          <td className="p-3.5 text-[#CBD5E1] max-w-[240px] truncate" title={item.description}>
                            {item.description}
                          </td>

                          {/* Pricing Basis */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <span className={`inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                              item.pricingBasis === 'weight'
                                ? 'bg-indigo-950/40 text-indigo-300 border-indigo-900/40'
                                : item.pricingBasis === 'quantity'
                                ? 'bg-[#3A2412]/40 text-[#FFAA5A] border-[#663E1F]/40'
                                : 'bg-slate-800/40 text-slate-200 border-slate-700/40'
                            }`}>
                              {item.pricingBasis === 'weight' ? 'بالوزن' : item.pricingBasis === 'quantity' ? 'بالعدد' : 'ثابت'}
                            </span>
                          </td>

                          {/* Weight */}
                          <td className="p-3.5 text-center font-mono font-medium text-slate-300">
                            {item.weight && item.weight > 0 ? (
                              <span>
                                {item.weight.toLocaleString('ar-EG', { maximumFractionDigits: 2 })}
                                <span className="text-[9px] text-[#5A6D88] mr-0.5">كجم</span>
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>

                          {/* Quantity (Count) */}
                          <td className="p-3.5 text-center font-mono font-bold text-[#CBD5E1]">
                            {item.quantity && item.quantity > 0 ? (
                              <span>
                                {item.quantity.toLocaleString('ar-EG')}
                                <span className="text-[9px] text-[#5A6D88] mr-0.5">وحدة</span>
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>

                          {/* Unit Price */}
                          <td className="p-3.5 text-left font-mono font-semibold text-[#A1B3CB]">
                            {item.price.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* Total calculated price */}
                          <td className="p-3.5 text-left font-mono font-extrabold text-emerald-450 bg-[#132A1F]/30">
                            {item.total.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* Comments */}
                          <td className="p-3.5 text-slate-400 max-w-[180px] truncate" title={item.notes}>
                            {item.notes || <span className="text-slate-500 text-[10px]">لا توجد ملاحظات</span>}
                          </td>

                          {/* Row Actions Controls (Hide in print mode) */}
                          <td className="p-3.5 text-center whitespace-nowrap no-print">
                            <div className="flex items-center justify-center gap-1.5">
                              
                              {/* Print item invoice */}
                              <button
                                onClick={() => setPrintingItem(item)}
                                className="p-1.5 bg-[#1C2235] text-slate-300 rounded-lg hover:bg-[#252E47] hover:text-white active:scale-90 transition-all cursor-pointer"
                                title="عرض ومعاينة الطباعة للفاتورة"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit details */}
                              <button
                                onClick={() => handleEditClick(item)}
                                className="p-1.5 bg-[#222543] text-indigo-400 rounded-lg hover:bg-[#2D315E] hover:text-indigo-200 active:scale-90 transition-all cursor-pointer"
                                title="تعديل هذا الفاتورة"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete row */}
                              <button
                                onClick={() => handleDeleteClick(item.id, item.serialNumber)}
                                className="p-1.5 bg-[#361E27] text-rose-450 rounded-lg hover:bg-[#4E2333] hover:text-rose-200 active:scale-90 transition-all cursor-pointer"
                                title="حذف القيد نهائياً"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Main general ledger footer signs (Only displays when printed) */}
              <div className="hidden print-only border-t border-slate-200 p-10 text-center text-xs mt-12 grid grid-cols-2 gap-4">
                <div className="space-y-6">
                  <div>توقيع المدقق / المحاسب</div>
                  <div className="w-40 border-b border-rose-300 mx-auto" />
                </div>
                <div className="space-y-6">
                  <div>اعتماد المدير العام</div>
                  <div className="w-40 border-b border-rose-300 mx-auto" />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --- TAB 2: METRICS & CHARTS TAB --- */}
        {activeTab === 'dashboard' && (
          <StatsDashboard sales={sales} currencySymbol={currencySymbol} />
        )}

        {/* --- TAB 3: SETTINGS & DIRECTORY MANAGEMENT TAB --- */}
        {activeTab === 'directories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
            
            {/* 1. General Preferences and store titles */}
            <div className="bg-[#131722] rounded-2xl p-6 border border-[#1E293B] shadow-xl space-y-5">
              <h3 className="font-bold text-sm text-slate-100 border-b border-[#242C3F] pb-3 block">التهيئة والإعدادات العامة</h3>
              
              {/* Change store name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400">اسم المتجر / الشركة مبيناً في الفواتير والتقارير</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="مثال: محلات النور لتجارة الجملة"
                  className="w-full bg-[#181D2D] border border-[#2E3A52] text-white placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl block focus:bg-[#1C2235] focus:outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              {/* Change Currency code */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400">رمز العملة (مثلاً ر.س، ج.م، $, USD)</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="ر.س"
                  className="w-full bg-[#181D2D] border border-[#2E3A52] text-white text-xs px-3.5 py-2.5 rounded-xl block focus:bg-[#1C2235] focus:outline-none focus:border-indigo-500 font-mono font-bold transition-all"
                />
              </div>

              {/* Quick instructions guide of total bases */}
              <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-900/30 text-xs text-indigo-300 space-y-2 leading-relaxed">
                <span className="font-bold flex items-center gap-1">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>طبيعة احتساب مبالغ الإجمالي:</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-indigo-200/80 pr-2">
                  <li>بالوزن: يضرب (الوزن × السعر)، رائع للمواد السائبة كالحديد والمعادن.</li>
                  <li>بالعدد: يضرب (العدد × السعر)، رائع للمنتجات المعلبة والأقراص والأكياس.</li>
                  <li>ثابت: يعتبر السعر هو الإجمالي كحد ذاته، رائع للخدمات والرسوم المقطوعة.</li>
                </ul>
              </div>

              {/* Reset Database Button */}
              <button
                onClick={handleResetToDemo}
                className="w-full bg-[#2D161F]/60 text-rose-405 hover:bg-[#3E1A29]/70 border border-[#521C2B] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer pt-3"
              >
                <RefreshCw className="w-4 h-4 text-rose-400" />
                <span>تصفير البرنامج تماماً والبدء من جديد</span>
              </button>
            </div>

            {/* 2. Customer Shortcuts Directory */}
            <div className="bg-[#131722] rounded-2xl p-6 border border-[#1E293B] shadow-xl flex flex-col max-h-[70vh]">
              <div className="border-b border-[#242C3F] pb-3 flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-100">سجل العملاء المحفوظين</h3>
                <span className="text-[10px] bg-indigo-950 text-indigo-350 px-2 py-0.5 rounded-md font-bold font-mono">{customers.length}</span>
              </div>

              {/* Add form customer */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = (e.currentTarget.elements.namedItem('newcust') as HTMLInputElement).value;
                  if (val.trim()) {
                    handleAddQuickCustomer(val.trim());
                    e.currentTarget.reset();
                  }
                }}
                className="flex gap-2 mb-4"
              >
                <input
                  type="text"
                  name="newcust"
                  required
                  placeholder="أدخل اسم عميل جديد..."
                  className="bg-[#181D2D] border border-[#2E3A52] text-white placeholder-slate-500 text-xs px-3 py-2 rounded-xl flex-1 focus:outline-none focus:border-indigo-500 font-sans"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer">إضافة</button>
              </form>

              {/* List customers */}
              <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
                {customers.map((cust) => (
                  <div key={cust.id} className="flex items-center justify-between p-2.5 bg-[#181D2D] hover:bg-[#1E253A] rounded-lg border border-[#242C3E] group">
                    <span className="text-xs font-semibold text-slate-200">{cust.name}</span>
                    <button
                      onClick={() => handleDeleteQuickCustomer(cust.id)}
                      className="text-rose-400 hover:bg-[#3E1A29]/30 p-1 rounded-md opacity-40 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="حذف العميل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Products Shortcuts Directory */}
            <div className="bg-[#131722] rounded-2xl p-6 border border-[#1E293B] shadow-xl flex flex-col max-h-[70vh]">
              <div className="border-b border-[#242C3F] pb-3 flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-100">سجل السلع / البيانات المحفوظة</h3>
                <span className="text-[10px] bg-amber-950 text-amber-350 px-2 py-0.5 rounded-md font-bold font-mono">{products.length}</span>
              </div>

              {/* Add form product */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const desc = (e.currentTarget.elements.namedItem('newprod_desc') as HTMLInputElement).value;
                  const prc = Number((e.currentTarget.elements.namedItem('newprod_prc') as HTMLInputElement).value) || 0;
                  const basis = (e.currentTarget.elements.namedItem('newprod_basis') as HTMLSelectElement).value as PricingBasis;
                  if (desc.trim()) {
                    handleAddQuickProduct(desc.trim(), prc, basis);
                    e.currentTarget.reset();
                  }
                }}
                className="space-y-2.5 bg-[#181D2D] p-3 rounded-xl border border-[#242C3F] mb-4"
              >
                <input
                  type="text"
                  name="newprod_desc"
                  required
                  placeholder="البيان (اسم الصنف الشائع)..."
                  className="w-full bg-[#131722] border border-[#2A3449] text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 font-sans"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="newprod_prc"
                    placeholder="السعر الإفتراضي..."
                    className="w-2/3 bg-[#131722] border border-[#2A3449] text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <select
                    name="newprod_basis"
                    className="w-1/3 bg-[#131722] border border-[#2A3449] text-white text-xs px-1.5 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
                  >
                    <option value={PricingBasis.BY_QUANTITY} className="bg-[#131722]">بالعدد</option>
                    <option value={PricingBasis.BY_WEIGHT} className="bg-[#131722]">بالوزن</option>
                    <option value={PricingBasis.FIXED} className="bg-[#131722]">ثابت</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 rounded-lg transition-all cursor-pointer">
                  حفظ الصنف للدليل الأعم
                </button>
              </form>

              {/* List products */}
              <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
                {products.map((prod) => (
                  <div key={prod.id} className="p-2.5 bg-[#181D2D] hover:bg-[#1E253A] rounded-lg border border-[#242C3E] group flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-150">{prod.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        السعر: <strong className="font-mono text-slate-200">{prod.defaultPrice} {currencySymbol}</strong> 
                        &nbsp;|&nbsp; 
                        الأساس: <span className="text-indigo-400">{prod.defaultBasis === 'weight' ? 'بالوزن' : prod.defaultBasis === 'quantity' ? 'بالعدد' : 'ثابت'}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteQuickProduct(prod.id)}
                      className="text-rose-450 hover:bg-[#3E1A29]/30 p-1 rounded-md opacity-40 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="حذف الصنف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- DUAL ROW: SYSTEM BACKUP SECTION --- */}
        {activeTab === 'directories' && (
          <div className="mt-6 bg-[#131722] rounded-2xl p-6 border border-[#1E293B] shadow-xl no-print">
            <h3 className="font-bold text-sm text-[#F1F5F9] border-b border-[#242C3F] pb-3 flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-[#818CF8]" />
              <span>النسخ الاحتياطي اليدوي ونقل البيانات الماليّة</span>
            </h3>
            
            <form onSubmit={handleImportBackup} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                نسخ آمن لقاعدة البيانات في جهازك! يمكنك نسخ النص المشفر بالأسفل لحفظ دفتر مبيعاتك كاملا في ملف نصي (Back-up)، أو لصق نص نسخة قديمة لاستعادتها فوراً على هذا النظام.
              </p>

              {backupStatus && (
                <div className={`p-4 rounded-xl flex items-start gap-2.5 text-xs font-semibold ${
                  backupStatus.type === 'success' ? 'bg-[#0E2F1F] text-emerald-300 border border-[#1A5C3D]' : 'bg-[#3A141C] text-rose-300 border border-[#6B212E]'
                }`}>
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p>{backupStatus.message}</p>
                </div>
              )}

              <textarea
                value={backupString}
                onChange={(e) => setBackupString(e.target.value)}
                rows={5}
                className="w-full bg-[#181D2D] border border-[#2E3A52] text-slate-100 font-mono text-xs p-3.5 rounded-xl block focus:outline-none focus:border-indigo-500 font-sans"
                placeholder="الصق كود الـ JSON المشفر للنسخ الاحتياطي هنا لاستعادة السجل بالكامل..."
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  تأكيد واستعادة النسخة الاحتياطية المُلصقة (Import JSON)
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* --- FORM OVERLAY MODAL --- */}
      {isFormOpen && (
        <SalesForm
          onSave={handleSaveSaleItem}
          onClose={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
          editingItem={editingItem}
          nextSerialNumber={editingItem ? editingItem.serialNumber : nextSerialNumber}
          customers={customers}
          products={products}
          onAddQuickCustomer={handleAddQuickCustomer}
          onAddQuickProduct={handleAddQuickProduct}
          currencySymbol={currencySymbol}
        />
      )}

      {/* --- PRINT BILL PREVIEW OVERLAY --- */}
      {printingItem && (
        <PrintInvoice
          saleItem={printingItem}
          onClose={() => setPrintingItem(null)}
          currencySymbol={currencySymbol}
        />
      )}

    </div>
  );
}
