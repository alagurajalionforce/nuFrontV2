// src/types/reconciliation.ts

export interface Transaction {
    customerId: string;
    merchantId: string;
    customername: string;
    merchantName: string;
    customerUserid: string;
    createdDt: string; // Will be ISO string from API, need to parse for Date object
    type: string;
    transactionId: string;
    trnType: 'C' | 'D'; // Credit or Debit
    trnInAmount: number | null;
    trnOutAmount: number | null;
    balanceAmount: number;
    invoiceId: string | null;
    invoiceNo: string | null;
    dealId: string;
    tipAmt: string; // Assuming string based on your sample, convert to number if needed
    invoiceAmount: string; // Assuming string based on your sample, convert to number if needed
}

export interface ReconciliationFilters {
    merchantId: string | null;
    customerId: string | null;
    transactionType: string | null;
    transactionId: string;
    invoiceNo: string;
    fromDate: Date | null;
    toDate: Date | null;
}

export interface SelectOption {
    value: string;
    label: string;
}