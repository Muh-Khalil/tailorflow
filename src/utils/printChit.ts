import * as Print from 'expo-print';
import { Alert } from 'react-native';
import { useAppStore } from '@/stores/appStore';

export interface CuttingChitData {
  orderNumber?: string;
  customerName: string;
  phone: string;
  area?: string;
  garmentType: string;
  deliveryDate?: string;
  notes?: string;
  measurements: Record<string, string | number>;
  unit?: 'inch' | 'cm';
}

export const MEASUREMENT_LABELS_URDU: Record<string, string> = {
  'Length': 'لمبائی',
  'Kameez Length': 'قمیض لمبائی',
  'Chest': 'چھاتی',
  'Shoulder': 'تیرا',
  'Sleeves': 'بازو',
  'Sleeve': 'بازو',
  'Collar': 'بین / گلا',
  'Neck': 'گلا',
  'Daman': 'دامن',
  'Bottom (Ghaer)': 'دامن / گھیر',
  'Waist': 'کمر',
  'Hip': 'کولہا',
  'Shalwar Length': 'شلوار لمبائی',
  'Pancha': 'پائینچہ',
  'Shirt Length': 'شرٹ لمبائی',
  'Pant Length': 'پینٹ لمبائی',
  'Coat Length': 'کوٹ لمبائی',
  'Trouser Length': 'ٹراؤزر لمبائی',
};

export async function printCuttingChit(data: CuttingChitData): Promise<boolean> {
  const unit = data.unit || 'in';
  const orderNum = data.orderNumber || `TF-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const entries = Object.entries(data.measurements)
    .filter(([_, val]) => val !== undefined && val !== null && String(val).trim() !== '');

  const count = entries.length;
  // Dynamic scaling so even chits with 18+ measurements and lengthy style notes fit on a single page
  const isDense = count > 10;
  const isUltraDense = count > 16;

  const cellPadding = isUltraDense ? '1.5px 3px' : isDense ? '2.5px 4px' : '4px 4px';
  const nameFontSize = isUltraDense ? '11.5px' : isDense ? '12.5px' : '13.5px';
  const urduFontSize = isUltraDense ? '10px' : isDense ? '11px' : '12px';
  const valFontSize = isUltraDense ? '13px' : isDense ? '15px' : '17px';
  const unitFontSize = isUltraDense ? '10px' : isDense ? '11px' : '12px';
  const boxPadding = isUltraDense ? '5px 7px' : isDense ? '6px 8px' : '8px 10px';
  const titleFontSize = isUltraDense ? '15px' : isDense ? '17px' : '19px';
  const urduTitleFontSize = isUltraDense ? '12px' : isDense ? '13px' : '15px';
  const custNameFontSize = isUltraDense ? '13.5px' : isDense ? '15px' : '16px';
  const custInfoPadding = isUltraDense ? '3px 0' : isDense ? '4px 0' : '6px 0';
  const custLineMargin = isUltraDense ? '1px' : '2px';
  const notesMargin = isUltraDense ? '3px' : '5px';
  const notesPadding = isUltraDense ? '3px 5px' : '5px 7px';
  const notesFontSize = isUltraDense ? '10.5px' : '11.5px';
  const footerMargin = isUltraDense ? '3px' : '5px';
  const footerPadding = isUltraDense ? '2px' : '4px';

  const measurementRows = entries
    .map(([key, val]) => {
      const hasUrduInKey = /[\u0600-\u06FF]/.test(key);
      const urduLabel = !hasUrduInKey ? (MEASUREMENT_LABELS_URDU[key] || '') : '';
      return `
        <tr>
          <td style="padding: ${cellPadding}; border-bottom: 1px dashed #666; font-size: ${nameFontSize}; font-weight: bold; line-height: 1.2;">
            ${key} ${urduLabel ? `<span style="font-size: ${urduFontSize}; color: #333; margin-left: 3px; font-weight: normal;">(${urduLabel})</span>` : ''}
          </td>
          <td style="padding: ${cellPadding}; border-bottom: 1px dashed #666; font-size: ${valFontSize}; font-weight: 900; text-align: right; letter-spacing: 0.3px; line-height: 1.2; white-space: nowrap;">
            ${val} <span style="font-size: ${unitFontSize}; font-weight: normal;">${unit}</span>
          </td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page {
            size: auto;
            margin: 4mm 5mm;
          }
          * {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #fff;
            color: #000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 2px;
            width: 100%;
          }
          .chit-box {
            border: 1.5px solid #000;
            padding: ${boxPadding};
            border-radius: 4px;
            max-width: 320px;
            margin: 0 auto;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .header {
            text-align: center;
            border-bottom: 1.5px solid #000;
            padding-bottom: ${isUltraDense ? '2px' : '4px'};
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .title {
            font-size: ${titleFontSize};
            font-weight: 900;
            letter-spacing: 0.8px;
            margin: 0;
            line-height: 1.1;
          }
          .urdu-title {
            font-size: ${urduTitleFontSize};
            font-weight: bold;
            margin: 1px 0 0 0;
            line-height: 1.1;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: ${isUltraDense ? '10px' : '11px'};
            font-weight: bold;
            margin-top: ${isUltraDense ? '2px' : '3px'};
            border-bottom: 1px solid #000;
            padding-bottom: ${isUltraDense ? '2px' : '3px'};
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .customer-info {
            padding: ${custInfoPadding};
            border-bottom: 1px solid #000;
            font-size: ${isUltraDense ? '10.5px' : '11.5px'};
            line-height: 1.25;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .cust-name {
            font-size: ${custNameFontSize};
            font-weight: 900;
            margin-bottom: ${custLineMargin};
            line-height: 1.2;
          }
          .table-title {
            font-size: ${isUltraDense ? '10px' : '11px'};
            font-weight: 900;
            text-align: center;
            background: #000;
            color: #fff;
            padding: ${isUltraDense ? '1.5px 3px' : '2.5px 4px'};
            margin: ${isUltraDense ? '3px 0 1px 0' : '4px 0 2px 0'};
            letter-spacing: 0.5px;
            text-transform: uppercase;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .notes-box {
            margin-top: ${notesMargin};
            padding: ${notesPadding};
            border: 1px dashed #000;
            background: #f8f8f8;
            font-size: ${notesFontSize};
            border-radius: 3px;
            line-height: 1.25;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .footer {
            text-align: center;
            margin-top: ${footerMargin};
            font-size: ${isUltraDense ? '9.5px' : '10.5px'};
            font-weight: bold;
            color: #444;
            border-top: 1px solid #000;
            padding-top: ${footerPadding};
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @media print {
            body {
              padding: 0;
            }
            .chit-box {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="chit-box">
          <div class="header">
            <h1 class="title">TAILORFLOW</h1>
            <div class="urdu-title">کٹنگ پَرچی (CUTTING SLIP)</div>
          </div>

          <div class="meta-row">
            <span>ORDER: #${orderNum}</span>
            <span>DATE: ${dateStr}</span>
          </div>

          <div class="customer-info">
            <div class="cust-name">${data.customerName || 'Walk-in Customer'}</div>
            <div><strong>Phone:</strong> ${data.phone || '—'} ${data.area ? `· <strong>Area:</strong> ${data.area}` : ''}</div>
            <div style="margin-top: ${custLineMargin};"><strong>Garment:</strong> ${data.garmentType}</div>
            ${data.deliveryDate ? `<div style="margin-top: ${custLineMargin}; color: #b91c1c;"><strong>Delivery Promised:</strong> ${data.deliveryDate}</div>` : ''}
          </div>

          <div class="table-title">
            MEASUREMENTS (${unit.toUpperCase()}) / ناپ
          </div>

          <table>
            <tbody>
              ${measurementRows.length > 0 ? measurementRows : '<tr><td colspan="2" style="padding: 6px; text-align: center; font-size: 12px;">No measurements recorded</td></tr>'}
            </tbody>
          </table>

          ${data.notes ? `
            <div class="notes-box">
              <strong>Style & Cut Notes (ڈیزائن):</strong><br>
              ${data.notes}
            </div>
          ` : ''}

          <div class="footer">
            Pin to fabric bundle · ${useAppStore.getState().shop?.name || 'TailorFlow'}
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await Print.printAsync({ html });
    return true;
  } catch (err: any) {
    Alert.alert('Print Error', err?.message || 'Could not connect to printer.');
    return false;
  }
}
