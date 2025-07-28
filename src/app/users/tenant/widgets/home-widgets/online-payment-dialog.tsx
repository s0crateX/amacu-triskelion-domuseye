"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CreditCard,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// SVG Logo Components
const GCashLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <Image
    src="/assets/svgs/gcash.svg"
    alt="GCash"
    width={32}
    height={32}
    className={className}
  />
);

const PayMayaLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <Image
    src="/assets/svgs/paymaya.svg"
    alt="PayMaya"
    width={32}
    height={32}
    className={className}
  />
);

interface PaymentFormData {
  paymentMethod: string;
  amount: string;
  billType: string;
  ewalletNumber?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

interface OnlinePaymentDialogProps {
  onSubmit?: (formData: PaymentFormData) => void;
  triggerClassName?: string;
  defaultAmount?: string;
  billType?: string;
  outstandingDues?: Array<{
    id: number;
    type: string;
    amount: string;
    dueDate: string;
    status: string;
  }>;
}

const paymentMethods = [
  {
    id: "gcash",
    name: "GCash",
    icon: <GCashLogo className="w-8 h-8" />,
    type: "ewallet",
    description: "Pay using your GCash wallet",
  },
  {
    id: "paymaya",
    name: "PayMaya",
    icon: <PayMayaLogo className="w-8 h-8" />,
    type: "ewallet", 
    description: "Pay using your PayMaya wallet",
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: "💳",
    type: "card",
    description: "Visa, Mastercard, JCB accepted",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: "🏦",
    type: "bank",
    description: "Direct bank to bank transfer",
  },
];

const philippineBanks = [
  "BDO Unibank",
  "Bank of the Philippine Islands (BPI)",
  "Metrobank",
  "Land Bank of the Philippines",
  "Philippine National Bank (PNB)",
  "Security Bank",
  "UnionBank",
  "Rizal Commercial Banking Corporation (RCBC)",
  "China Banking Corporation",
  "EastWest Bank",
  "Maybank Philippines",
  "HSBC Philippines",
  "Standard Chartered Bank",
  "Citibank Philippines",
  "Development Bank of the Philippines (DBP)",
];

export default function OnlinePaymentDialog({ 
  onSubmit,
  triggerClassName = "w-full",
  defaultAmount = "",
  billType = "",
  outstandingDues = []
}: OnlinePaymentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: "",
    amount: defaultAmount,
    billType: billType,
  });

  const selectedMethod = paymentMethods.find(method => method.id === formData.paymentMethod);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log("Payment submitted:", formData);
      alert("Payment processed successfully!");
    }
    
    // Reset form and close dialog
    setFormData({
      paymentMethod: "",
      amount: "",
      billType: "",
    });
    setIsOpen(false);
  };

  const isFormValid = formData.paymentMethod && formData.amount && formData.billType &&
    (formData.paymentMethod === "gcash" || formData.paymentMethod === "paymaya" ? formData.ewalletNumber :
     formData.paymentMethod === "card" ? formData.cardNumber && formData.expiryDate && formData.cvv && formData.cardholderName :
     formData.paymentMethod === "bank" ? formData.bankName && formData.accountNumber && formData.accountName : false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>
          <CreditCard className="w-4 h-4 mr-2" />
          Make Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl mx-auto my-4 max-h-[95vh] overflow-hidden flex flex-col p-0">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 pt-6 pb-4 border-b border-border">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center text-lg sm:text-xl font-semibold">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
              <span className="truncate">Online Payment</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Pay your bills securely using GCash, PayMaya, credit/debit card, or bank transfer.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            
            {/* Bill Selection */}
            <div className="space-y-2">
              <Label htmlFor="billType" className="text-sm font-medium text-foreground">
                Select Bill to Pay <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.billType} onValueChange={(value) => setFormData(prev => ({ ...prev, billType: value }))}>
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue placeholder="Choose what to pay" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto z-50 w-auto min-w-[280px] max-w-[calc(100vw-4rem)]" side="bottom" align="start" avoidCollisions={true} collisionPadding={16}>
                  <SelectItem value="monthly-rent">🏠 Monthly Rent</SelectItem>
                  <SelectItem value="electricity">⚡ Electricity Bill</SelectItem>
                  <SelectItem value="water">💧 Water Bill</SelectItem>
                  <SelectItem value="internet">📶 Internet Bill</SelectItem>
                  <SelectItem value="maintenance-fee">🔧 Maintenance Fee</SelectItem>
                  <SelectItem value="security-deposit">🛡️ Security Deposit</SelectItem>
                  <SelectItem value="other">📝 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                Amount <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₱</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="h-10 sm:h-11 pl-8"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Outstanding Dues Quick Select */}
            {outstandingDues.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Quick Select from Outstanding Dues</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {outstandingDues.map((due) => (
                    <Card 
                      key={due.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.billType === due.type.toLowerCase().replace(/\s+/g, '-') && 
                        formData.amount === due.amount.replace('₱', '').replace(',', '') 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          billType: due.type.toLowerCase().replace(/\s+/g, '-'),
                          amount: due.amount.replace('₱', '').replace(',', '')
                        }));
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{due.type}</p>
                            <p className="text-xs text-muted-foreground">Due: {due.dueDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{due.amount}</p>
                            {due.status === 'overdue' && (
                              <Badge variant="destructive" className="text-xs">Overdue</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-foreground">
                Payment Method <span className="text-destructive">*</span>
              </Label>
              <RadioGroup 
                value={formData.paymentMethod} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label 
                      htmlFor={method.id} 
                      className="flex-1 cursor-pointer"
                    >
                      <Card className={`transition-all hover:shadow-md ${
                        formData.paymentMethod === method.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8">
                              {typeof method.icon === 'string' ? (
                                <span className="text-2xl">{method.icon}</span>
                              ) : (
                                method.icon
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{method.name}</p>
                              <p className="text-xs text-muted-foreground">{method.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Payment Details based on selected method */}
            {selectedMethod && (
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
                <h4 className="font-medium text-foreground flex items-center">
                  <div className="flex items-center justify-center w-6 h-6 mr-2">
                    {typeof selectedMethod.icon === 'string' ? (
                      <span className="text-lg">{selectedMethod.icon}</span>
                    ) : selectedMethod.id === 'gcash' ? (
                      <GCashLogo className="w-6 h-6" />
                    ) : selectedMethod.id === 'paymaya' ? (
                      <PayMayaLogo className="w-6 h-6" />
                    ) : (
                      selectedMethod.icon
                    )}
                  </div>
                  {selectedMethod.name} Details
                </h4>

                {/* E-wallet Details */}
                {(selectedMethod.type === "ewallet") && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ewalletNumber" className="text-sm font-medium text-foreground">
                        {selectedMethod.name} Mobile Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="ewalletNumber"
                        type="tel"
                        placeholder="09XX XXX XXXX"
                        value={formData.ewalletNumber || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, ewalletNumber: e.target.value }))}
                        className="h-10 sm:h-11"
                        pattern="[0-9]{11}"
                        maxLength={11}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your registered {selectedMethod.name} mobile number
                      </p>
                    </div>
                  </div>
                )}

                {/* Card Details */}
                {selectedMethod.type === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardholderName" className="text-sm font-medium text-foreground">
                        Cardholder Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="cardholderName"
                        placeholder="Name as it appears on card"
                        value={formData.cardholderName || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                        className="h-10 sm:h-11"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-sm font-medium text-foreground">
                        Card Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                        className="h-10 sm:h-11"
                        maxLength={19}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate" className="text-sm font-medium text-foreground">
                          Expiry Date <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={formData.expiryDate || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                          className="h-10 sm:h-11"
                          maxLength={5}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-sm font-medium text-foreground">
                          CVV <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="cvv"
                            type={showCvv ? "text" : "password"}
                            placeholder="123"
                            value={formData.cvv || ""}
                            onChange={(e) => setFormData(prev => ({ ...prev, cvv: e.target.value }))}
                            className="h-10 sm:h-11 pr-10"
                            maxLength={4}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCvv(!showCvv)}
                          >
                            {showCvv ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Details */}
                {selectedMethod.type === "bank" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="text-sm font-medium text-foreground">
                        Bank Name <span className="text-destructive">*</span>
                      </Label>
                      <Select value={formData.bankName || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, bankName: value }))}>
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] overflow-y-auto z-50 w-auto min-w-[280px] max-w-[calc(100vw-4rem)]" side="bottom" align="start" avoidCollisions={true} collisionPadding={16}>
                          {philippineBanks.map((bank) => (
                            <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="accountName" className="text-sm font-medium text-foreground">
                        Account Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="accountName"
                        placeholder="Account holder name"
                        value={formData.accountName || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                        className="h-10 sm:h-11"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="text-sm font-medium text-foreground">
                        Account Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="accountNumber"
                        placeholder="Enter account number"
                        value={formData.accountNumber || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                        className="h-10 sm:h-11"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Notice */}
            <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Secure Payment</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 px-4 sm:px-6 pb-6 pt-4 border-t border-border bg-background">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto h-10 sm:h-11 px-6 sm:px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full sm:flex-1 h-10 sm:h-11 px-6 sm:px-8 font-medium"
              disabled={!isFormValid}
            >
              {formData.amount ? `Pay ₱${parseFloat(formData.amount).toLocaleString()}` : 'Process Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}