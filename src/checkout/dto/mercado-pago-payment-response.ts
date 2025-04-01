export interface MercadoPagoPaymentResponse {
  accounts_info: any;
  acquirer_reconciliation: any[];
  additional_info: AdditionalInfo;
  authorization_code?: string;
  binary_mode: boolean;
  brand_id: any;
  build_version: string;
  call_for_authorize_id: any;
  captured: boolean;
  card?: Card;
  charges_details: ChargesDetail[];
  charges_execution_info?: ChargesExecutionInfo;
  collector_id: number;
  corporation_id: any;
  counter_currency: any;
  coupon_amount: number;
  currency_id: string;
  date_approved: string;
  date_created: string;
  date_last_updated: string;
  date_of_expiration: string | null;
  deduction_schema: any;
  description: string;
  differential_pricing_id: any;
  external_reference: string;
  fee_details: FeeDetail[];
  financing_group: any;
  id: number;
  installments: number;
  integrator_id: any;
  issuer_id: string;
  live_mode: boolean;
  marketplace_owner: any;
  merchant_account_id: any;
  merchant_number: any;
  metadata: Metadata2;
  money_release_date: string;
  money_release_schema: any;
  money_release_status: string;
  notification_url: string;
  operation_type: string;
  order: Order;
  payer: Payer;
  payment_method: PaymentMethod;
  payment_method_id: string;
  payment_type_id: string;
  platform_id: any;
  point_of_interaction: PointOfInteraction;
  pos_id: any;
  processing_mode: string;
  refunds: any[];
  release_info: any;
  shipping_amount: number;
  sponsor_id: any;
  statement_descriptor?: string;
  status: string;
  status_detail: string;
  store_id: any;
  tags: any;
  taxes_amount: number;
  transaction_amount: number;
  transaction_amount_refunded: number;
  transaction_details: TransactionDetails;
}

export interface AdditionalInfo {
  bank_info?: BankInfo;
  items: Item[];
  tracking_id: string;
}

export interface BankInfo {
  is_same_bank_account_owner: boolean;
}

export interface Item {
  category_id: string;
  description: string;
  id: string;
  quantity: string;
  title: string;
  unit_price: string;
}

export interface Card {
  cardholder: Cardholder;
  country: any;
  date_created: string;
  date_last_updated: string;
  expiration_month: number;
  expiration_year: number;
  first_six_digits: string;
  id: any;
  last_four_digits: string;
  tags: any[];
}

export interface Cardholder {
  identification: Identification;
  name: string;
}

export interface Identification {
  number: string;
  type: string;
}

export interface ChargesDetail {
  accounts: Accounts;
  amounts: Amounts;
  client_id: number;
  date_created: string;
  id: string;
  last_updated: string;
  metadata: Metadata;
  name: string;
  refund_charges: any[];
  reserve_id: any;
  type: string;
}

export interface Accounts {
  from: string;
  to: string;
}

export interface Amounts {
  original: number;
  refunded: number;
}

export interface Metadata {
  source: string;
}

export interface ChargesExecutionInfo {
  internal_execution: InternalExecution;
}

export interface InternalExecution {
  date: string;
  execution_id: string;
}

export interface FeeDetail {
  amount: number;
  fee_payer: string;
  type: string;
}

export interface Metadata2 {}

export interface Order {}

export interface Payer {
  email: string;
  entity_type: any;
  first_name: any;
  id: string;
  identification: Identification;
  last_name: any;
  operator_id?: any;
  phone: Phone;
  type: any;
}

export interface Phone {
  number: any;
  extension: any;
  area_code: any;
}

export interface PaymentMethod {
  id: string;
  issuer_id: string;
  type: string;
  data?: {
    routing_data: {
      merchant_account_id: string;
    };
  };
}

export interface PointOfInteraction {
  application_data?: ApplicationData;
  business_info: BusinessInfo;
  location?: Location;
  sub_type?: string;
  transaction_data?: TransactionData;
  type: string;
}

export interface ApplicationData {
  name: any;
  version: any;
}

export interface BusinessInfo {
  branch: string;
  sub_unit: string;
  unit: string;
}

export interface Location {
  source: any;
  state_id: any;
}

export interface TransactionData {
  bank_info: BankInfo2;
  bank_transfer_id: number;
  e2e_id: any;
  financial_institution: number;
  infringement_notification: InfringementNotification;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
  transaction_id: string;
}

export interface BankInfo2 {
  collector: Collector;
  is_same_bank_account_owner: boolean;
  origin_bank_id: any;
  origin_wallet_id: any;
  payer: Payer2;
}

export interface Collector {
  account_holder_name: string;
  account_id: number;
  long_name: string;
  transfer_account_id: any;
}

export interface Payer2 {
  account_id: number;
  branch: string;
  external_account_id: any;
  id: any;
  identification: Identification2;
  long_name: string;
}

export interface Identification2 {}

export interface InfringementNotification {
  status: any;
  type: any;
}

export interface TransactionDetails {
  acquirer_reference: any;
  bank_transfer_id?: number;
  external_resource_url: any;
  financial_institution: string | null;
  installment_amount: number;
  net_received_amount: number;
  overpaid_amount: number;
  payable_deferral_period: any;
  payment_method_reference_id: any;
  total_paid_amount: number;
  transaction_id?: string;
}
