/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { SaleItem } from '../types';
import {
  TrendingUp,
  Scale,
  Hash,
  DollarSign,
  Users,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface StatsDashboardProps {
  sales: SaleItem[];
  currencySymbol: string;
}

export default function StatsDashboard({ sales, currencySymbol }: StatsDashboardProps) {
  // 1. Calculate General KPI Metrics
  const { totalSales, totalWeight, totalQuantity, avgPrice, totalTransactions } = useMemo(() => {
    if (sales.length === 0) {
      return { totalSales: 0, totalWeight: 0, totalQuantity: 0, avgPrice: 0, totalTransactions: 0 };
    }
    const totalSalesSum = sales.reduce((sum, item) => sum + item.total, 0);
    const totalWeightSum = sales.reduce((sum, item) => sum + item.weight, 0);
    const totalQuantitySum = sales.reduce((sum, item) => sum + item.quantity, 0);
    const avgPriceValue = totalSalesSum / sales.length;

    return {
      totalSales: totalSalesSum,
      totalWeight: totalWeightSum,
      totalQuantity: totalQuantitySum,
      avgPrice: avgPriceValue,
      totalTransactions: sales.length
    };
  }, [sales]);

  // 2. Prepare sales data for AreaChart (Sales Over Time)
  const salesOverTime = useMemo(() => {
    const dailyMap: { [date: string]: number } = {};
    sales.forEach(item => {
      // Format/Group date to keep it simple YYYY-MM-DD
      const date = item.date;
      dailyMap[date] = (dailyMap[date] || 0) + item.total;
    });

    // Sort by date key
    return Object.keys(dailyMap)
      .sort()
      .map(date => ({
        date: date.substring(5), // Just MM-DD for cleaner chart labeling
        total: dailyMap[date]
      }));
  }, [sales]);

  // 3. Prepare Customer Share (Pie Chart)
  const topCustomersData = useMemo(() => {
    const customerMap: { [name: string]: number } = {};
    sales.forEach(item => {
      const name = item.customerName || 'عميل نقدي/مجهول';
      customerMap[name] = (customerMap[name] || 0) + item.total;
    });

    return Object.keys(customerMap)
      .map(name => ({
        name,
        value: Math.round(customerMap[name])
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Take top 5
    }, [sales]);

  // 4. Prepare Product distribution data (Bar Chart)
  const productDistribution = useMemo(() => {
    const prodMap: { [name: string]: { total: number; qty: number; wgt: number } } = {};
    sales.forEach(item => {
      const desc = item.description || 'منتج عام';
      if (!prodMap[desc]) {
        prodMap[desc] = { total: 0, qty: 0, wgt: 0 };
      }
      prodMap[desc].total += item.total;
      prodMap[desc].qty += item.quantity;
      prodMap[desc].wgt += item.weight;
    });

    return Object.keys(prodMap)
      .map(desc => ({
        name: desc.length > 20 ? desc.substring(0, 20) + '...' : desc,
        totalSales: Math.round(prodMap[desc].total),
        quantity: prodMap[desc].qty,
        weight: prodMap[desc].wgt
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 6);
  }, [sales]);

  // Stylish colors for Charts
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div id="dashboard-container" className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Sales Card */}
        <div id="kpi-sales" className="bg-[#131722] rounded-2xl p-6 border border-[#1E293B] shadow-xl flex items-center justify-between hover:shadow-black/20 hover:border-indigo-500/20 transition-all duration-200">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">إجمالي المبيعات</span>
            <h3 className="text-2xl font-bold text-white tracking-tight font-sans">
              {totalSales.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-emerald-400 font-medium">{currencySymbol}</span>
            </h3>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium pt-1">
              <TrendingUp className="w-3 h-3" />
              <span>معدل نشاط إيجابي</span>
            </div>
          </div>
          <div className="p-3 bg-[#0E2F1F]/60 rounded-xl text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Weight Card */}
        <div id="kpi-weight" className="bg-[#131722] rounded-2xl p-6 border border-[#1E293B] shadow-xl flex items-center justify-between hover:shadow-black/20 hover:border-indigo-500/20 transition-all duration-200">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">إجمالي الأوزان المباعة</span>
            <h3 className="text-2xl font-bold text-white tracking-tight font-sans">
              {totalWeight.toLocaleString('ar-EG', { maximumFractionDigits: 2 })} <span className="text-xs text-indigo-400 font-medium">كجم</span>
            </h3>
            <div className="text-xs text-slate-500 font-medium pt-1">
              <span>لكافة السلع المبيعة بالوزن</span>
            </div>
          </div>
          <div className="p-3 bg-[#1A1B3D]/70 rounded-xl text-[#818CF8]">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        {/* Total Quantity Card */}
        <div id="kpi-quantity" className="bg-[#131722] rounded-2xl p-6 border border-[#1E293B] shadow-xl flex items-center justify-between hover:shadow-black/20 hover:border-indigo-500/20 transition-all duration-200">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">إجمالي الأعداد/القطع</span>
            <h3 className="text-2xl font-bold text-white tracking-tight font-sans">
              {totalQuantity.toLocaleString('ar-EG')} <span className="text-xs text-amber-400 font-medium">وحدة</span>
            </h3>
            <div className="text-xs text-slate-500 font-medium pt-1">
              <span>لكافة السلع المبيعة بالعدد</span>
            </div>
          </div>
          <div className="p-3 bg-[#3A2412]/60 rounded-xl text-[#FFAA5A]">
            <Hash className="w-6 h-6" />
          </div>
        </div>

        {/* Total Transactions Card */}
        <div id="kpi-transactions" className="bg-[#131722] rounded-2xl p-6 border border-[#1E293B] shadow-xl flex items-center justify-between hover:shadow-black/20 hover:border-indigo-500/20 transition-all duration-200">
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium">عدد الفواتير / القيود</span>
            <h3 className="text-2xl font-bold text-white tracking-tight font-sans">
              {totalTransactions} <span className="text-xs text-sky-400 font-medium">فاتورة</span>
            </h3>
            <div className="text-xs text-slate-500 font-medium pt-1">
              <span>متوسط السعر: {Math.round(avgPrice).toLocaleString()} {currencySymbol}</span>
            </div>
          </div>
          <div className="p-3 bg-[#15233A]/70 rounded-xl text-sky-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area Chart: Sales Trend */}
        <div id="chart-sales-trend" className="bg-[#131722] rounded-2xl p-5 border border-[#1E293B] shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-100">مخطط المبيعات اليومية</h4>
              <p className="text-xs text-slate-400 mt-0.5">تفاصيل نموّ المبيعات وحركات الإيرادات المالية اليومية</p>
            </div>
            <div className="text-xs bg-[#1D253A] text-slate-300 font-medium px-2.5 py-1 rounded-full border border-[#2E374D]">
              خط زمني
            </div>
          </div>
          <div className="h-72 w-full">
            {salesOverTime.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                لا توجد بيانات كافية لرسم المخطط البياني للمبيعات
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#94A3B8', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#94A3B8', fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc', fontFamily: 'Cairo', fontSize: '12px' }}
                    labelFormatter={(label) => `التاريخ: ${label}`}
                    formatter={(value) => [`${value} ${currencySymbol}`, 'قيمة المبيعات']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart: Top Customers Distribution */}
        <div id="chart-customers" className="bg-[#131722] rounded-2xl p-5 border border-[#1E293B] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-100">حصة كبار العملاء</h4>
              <p className="text-xs text-slate-400 mt-0.5">تقسيم المبيعات الإجمالية على أهم 5 عملاء في السجل</p>
            </div>
          </div>
          <div className="h-56 w-full relative flex items-center justify-center">
            {topCustomersData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                لا توجد بيانات عملاء كافية لعرضها
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCustomersData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {topCustomersData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc', fontFamily: 'Cairo', fontSize: '11px' }}
                    formatter={(value) => [`${value} ${currencySymbol}`, 'حجم المشتريات']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Custom Legends */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {topCustomersData.map((customer, idx) => (
              <div key={customer.name} className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-[11px] text-slate-300 font-medium truncate" title={customer.name}>{customer.name}</span>
                <span className="text-[10px] text-slate-500 font-mono mr-auto flex-shrink-0">({Math.round((customer.value / (totalSales || 1)) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Top Selling Goods (Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart: Goods Distribution */}
        <div id="chart-products" className="bg-[#131722] rounded-2xl p-5 border border-[#1E293B] shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-100">الأصناف الأكثر طلباً ومبيعاً</h4>
              <p className="text-xs text-slate-400 mt-0.5">تحليل الإيرادات والكميات المباعة لكل مادة/بيان في السجل</p>
            </div>
          </div>
          <div className="h-60 w-full">
            {productDistribution.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                لا توجد بيانات أصناف متاحة
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productDistribution} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fill: '#CBD5E1', fontSize: 10, width: 120 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc', fontFamily: 'Cairo', fontSize: '11px' }}
                    formatter={(value) => [`${value} ${currencySymbol}`, 'إجمالي المبيعات']}
                  />
                  <Bar dataKey="totalSales" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12}>
                    {productDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stats card: Insights & Quick Audits */}
        <div id="insight-card" className="bg-gradient-to-br from-[#0F121C] to-[#141A29] rounded-2xl p-6 border border-[#20293D] text-white flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400 bg-[#192135]/60 w-max px-2.5 py-1 rounded-full border border-[#2C3854]">تقرير استشاري ذكي</span>
            <h4 className="text-base font-bold text-white tracking-wide">أداء المبيعات وسلوك العملاء</h4>
            
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  العميل الأعلى طلباً هو <span className="font-semibold text-white">{(topCustomersData[0]?.name) || 'غير متوفر'}</span> بإجمالي مشتريات تبلغ {(topCustomersData[0]?.value || 0).toLocaleString()} {currencySymbol}.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  تم بيع سلع بوزن تراكمي يعادل <span className="font-semibold text-white">{totalWeight.toLocaleString()} كجم</span> وبعدد إجمالي <span className="font-semibold text-white">{totalQuantity.toLocaleString()} وحدات/قطع</span>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  المبيعات المسجلة بالوزن تُمثل جزءاً كبيراً من المعاملات؛ تأكد من تعبئة دقيقة للوزن لضمان جودة الأرقام.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#242E44] flex justify-between items-center text-xs text-slate-400">
            <span>تحديث البيانات: فوري وفارِز</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" /> متصل ومحفوظ محلّياً
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
