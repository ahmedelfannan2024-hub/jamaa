/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PricingBasis {
  BY_WEIGHT = 'weight',     // الإجمالي = الوزن × السعر
  BY_QUANTITY = 'quantity', // الإجمالي = العدد × السعر
  FIXED = 'fixed'           // الإجمالي = السعر مباشرة
}

export interface SaleItem {
  id: string;               // معرّف فريد داخلي
  serialNumber: number;     // رقم المسلسل المتسلسل (مسلسل)
  date: string;             // التاريخ
  customerName: string;     // اسم العميل
  description: string;      // البيان (اسم الصنف / تفاصيل)
  weight: number;           // الوزن
  quantity: number;         // العدد
  price: number;            // السعر
  pricingBasis: PricingBasis; // أساس التسعير
  total: number;            // الإجمالي
  notes: string;            // الملاحظات
}

export interface CustomerQuickLink {
  id: string;
  name: string;
  privelege?: boolean;
}

export interface ProductQuickLink {
  id: string;
  description: string;
  defaultPrice?: number;
  defaultBasis?: PricingBasis;
}
