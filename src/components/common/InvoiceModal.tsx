import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { Printer, CheckCircle, Mail, X, Calendar, Building2, User, CreditCard } from 'lucide-react';

export const InvoiceModal: React.FC = () => {
  const { selectedInvoice, setSelectedInvoice, updateInvoiceStatus, coagents, settings } = useBudget();
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  if (!selectedInvoice) return null;

  const coagent = coagents.find((c) => c.id === selectedInvoice.coagentId);

  const handlePrint = () => {
    window.print();
  };

  const handleMarkPaid = () => {
    updateInvoiceStatus(selectedInvoice.id, 'Paid');
  };

  const handleSendEmail = () => {
    setEmailNotice(`Invoice ${selectedInvoice.invoiceNumber} emailed to ${coagent?.email || 'client'}!`);
    setTimeout(() => setEmailNotice(null), 3500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-[#E6F9F0] text-[#10B981]';
      case 'Sent':
        return 'bg-[#EDEEFD] text-[#4E53EE]';
      case 'Draft':
        return 'bg-[#FEF6E7] text-[#F59E0B]';
      default:
        return 'bg-slate-100 text-[#8C93AB]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#161926] rounded-2xl shadow-2xl overflow-hidden my-8 border border-[#F0F2F7] dark:border-[#232738]">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#1E2238] dark:bg-[#10121C] text-white border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm tracking-tight">Invoice Details</span>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${getStatusBadge(selectedInvoice.status)}`}>
              {selectedInvoice.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-[#A5B4FC]" />
              Resend Email
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#10B981]" />
              Print / PDF
            </button>
            {selectedInvoice.status !== 'Paid' && (
              <button
                onClick={handleMarkPaid}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#10B981] hover:bg-[#059669] text-white rounded-xl transition shadow-xs cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark as Paid
              </button>
            )}
            <button
              onClick={() => setSelectedInvoice(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice toast */}
        {emailNotice && (
          <div className="no-print bg-[#EDEEFD] dark:bg-[#4E53EE]/20 text-[#4E53EE] dark:text-[#818CF8] px-6 py-2.5 text-xs font-bold flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#4E53EE] dark:text-[#818CF8]" />
            {emailNotice}
          </div>
        )}

        {/* Printable Invoice Document Body */}
        <div className="p-8 md:p-12 text-[#1E2238] dark:text-[#EAECEF] space-y-8 bg-white dark:bg-[#161926]" id="printable-invoice">
          
          {/* Header with SalesPro style logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-[#F0F2F7] dark:border-[#232738]">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#4E53EE] text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                  {settings.businessName.charAt(0)}
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-[#1E2238] dark:text-white">
                  {settings.businessName}
                </h2>
              </div>
              <p className="text-xs text-[#8C93AB] mt-1 max-w-xs">{settings.businessAddress}</p>
              <p className="text-xs text-[#8C93AB]">{settings.businessEmail} • {settings.businessPhone}</p>
              {settings.taxNumber && (
                <p className="text-xs text-[#8C93AB]">Tax ID: {settings.taxNumber}</p>
              )}
            </div>

            <div className="sm:text-right">
              <div className="text-xs uppercase tracking-widest text-[#8C93AB] font-bold">Invoice</div>
              <div className="text-xl font-mono font-extrabold text-[#4E53EE] dark:text-[#818CF8] mt-0.5">
                {selectedInvoice.invoiceNumber}
              </div>
              <div className="mt-2 text-xs text-[#8C93AB] space-y-0.5">
                <div>
                  <span className="text-[#8C93AB]">Date: </span>
                  <span className="font-bold text-[#1E2238] dark:text-white">{selectedInvoice.issueDate}</span>
                </div>
                <div>
                  <span className="text-[#8C93AB]">Due Date: </span>
                  <span className="font-bold text-[#1E2238] dark:text-white">{selectedInvoice.dueDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-[#F8F9FC] dark:bg-[#1C2030] border border-[#F0F2F7] dark:border-[#232738]">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#4E53EE] dark:text-[#818CF8]">Billed To</span>
              <h3 className="text-base font-extrabold text-[#1E2238] dark:text-white mt-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#8C93AB]" />
                {coagent?.company || coagent?.name || 'Client'}
              </h3>
              {coagent?.name && coagent.name !== coagent.company && (
                <p className="text-xs text-[#8C93AB] flex items-center gap-1 mt-0.5 font-medium">
                  <User className="w-3.5 h-3.5 text-[#8C93AB]" />
                  Attn: {coagent.name}
                </p>
              )}
              {coagent?.address && <p className="text-xs text-[#8C93AB] mt-1">{coagent.address}</p>}
              {coagent?.email && <p className="text-xs text-[#8C93AB]">{coagent.email}</p>}
              {coagent?.taxId && <p className="text-xs text-[#8C93AB]">VAT/Tax ID: {coagent.taxId}</p>}
            </div>

            <div className="sm:text-right flex flex-col sm:items-end justify-center">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C93AB]">Total Due</span>
              <div className="text-3xl font-extrabold text-[#4E53EE] dark:text-[#818CF8] mt-1 font-mono">
                ${selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-[#8C93AB] mt-1 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                Due by {selectedInvoice.dueDate}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F0F2F7] dark:border-[#232738] text-[11px] font-bold uppercase tracking-wider text-[#8C93AB]">
                  <th className="py-2.5 px-2">Description</th>
                  <th className="py-2.5 px-2 text-center w-16">Qty</th>
                  <th className="py-2.5 px-2 text-right w-28">Rate</th>
                  <th className="py-2.5 px-2 text-right w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FC] dark:divide-[#232738] text-xs">
                {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                  selectedInvoice.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-3 px-2 font-bold text-[#1E2238] dark:text-[#EAECEF]">{item.description}</td>
                      <td className="py-3 px-2 text-center text-[#8C93AB] font-semibold">{item.quantity}</td>
                      <td className="py-3 px-2 text-right text-[#8C93AB] font-mono">
                        ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-2 text-right font-extrabold text-[#1E2238] dark:text-white font-mono">
                        ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 px-2 font-bold text-[#1E2238] dark:text-[#EAECEF]">{selectedInvoice.notes || 'Professional Services'}</td>
                    <td className="py-3 px-2 text-center text-[#8C93AB]">1</td>
                    <td className="py-3 px-2 text-right text-[#8C93AB] font-mono">
                      ${selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-2 text-right font-extrabold text-[#1E2238] dark:text-white font-mono">
                      ${selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Subtotal & Total */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-[#8C93AB]">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-[#1E2238] dark:text-[#EAECEF]">${selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-[#8C93AB]">
                <span>Tax (0.00%)</span>
                <span className="font-mono">$0.00</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#1E2238] dark:text-white border-t border-[#F0F2F7] dark:border-[#232738] pt-2">
                <span>Total Due</span>
                <span className="text-[#4E53EE] dark:text-[#818CF8] font-mono">
                  ${selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-t border-[#F0F2F7] dark:border-[#232738] pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#8C93AB]">
            <div className="space-y-1.5">
              <div className="font-bold text-[#1E2238] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#4E53EE] dark:text-[#818CF8]" />
                Payment Instructions
              </div>
              <p>Please make bank transfer to the following account:</p>
              <div className="bg-[#F8F9FC] dark:bg-[#1C2030] p-3.5 rounded-xl border border-[#F0F2F7] dark:border-[#232738] font-mono text-[11px] space-y-1 text-[#1E2238] dark:text-[#EAECEF]">
                <div><span className="text-[#8C93AB]">Bank:</span> {settings.bankName}</div>
                <div><span className="text-[#8C93AB]">IBAN:</span> {settings.iban}</div>
                <div><span className="text-[#8C93AB]">SWIFT / BIC:</span> {settings.swift}</div>
                <div><span className="text-[#8C93AB]">Beneficiary:</span> {settings.businessName}</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="font-bold text-[#1E2238] dark:text-white uppercase tracking-wider">Notes & Terms</div>
              <p className="text-[#8C93AB]">
                {selectedInvoice.notes || `Payment is requested within ${settings.paymentTermsDays} days of invoice date. Thank you for your business!`}
              </p>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="no-print bg-[#F8F9FC] dark:bg-[#1C2030] px-6 py-4 border-t border-[#F0F2F7] dark:border-[#232738] flex justify-end gap-3">
          <button
            onClick={() => setSelectedInvoice(null)}
            className="px-4 py-2 text-xs font-bold text-[#8C93AB] hover:text-[#1E2238] dark:hover:text-white bg-white dark:bg-[#252A3D] border border-[#E5E7EB] dark:border-[#2A2F45] rounded-xl transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-[#4E53EE] hover:bg-[#4338CA] rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>

      </div>
    </div>
  );
};
