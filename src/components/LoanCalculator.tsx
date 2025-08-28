import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Interest rates data structure
const RATES = [
  { term: 3, method: 'Salary Deduction', bank: 'Yoma Bank Deduction', rate: 0.0376 },
  { term: 6, method: 'Salary Deduction', bank: 'Yoma Bank Deduction', rate: 0.0376 },
  { term: 3, method: 'Salary Deduction', bank: 'Other Bank', rate: 0.041 },
  { term: 6, method: 'Salary Deduction', bank: 'Other Bank', rate: 0.041 },
  { term: 3, method: 'Cash Payment', bank: 'Standard', rate: 0.045 },
  { term: 6, method: 'Cash Payment', bank: 'Standard', rate: 0.045 },
];

// Exchange rates (mock data)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 2100,
  EUR: 2300,
  SGD: 1550,
  THB: 60,
  MMK: 1,
};

const LoanCalculator = () => {
  const [term, setTerm] = useState<number>(3);
  const [method, setMethod] = useState<string>('Salary Deduction');
  const [bank, setBank] = useState<string>('Yoma Bank Deduction');
  const [currency, setCurrency] = useState<string>('USD');
  const [productPrice, setProductPrice] = useState<string>('');
  const [priceMmk, setPriceMmk] = useState<number>(0);
  
  const [results, setResults] = useState({
    monthlyRepayment: 0,
    totalRepayment: 0,
    monthlyInterest: 0,
    interestRate: 0,
  });

  // Update MMK price when currency or product price changes
  useEffect(() => {
    if (productPrice && !isNaN(Number(productPrice))) {
      const converted = Number(productPrice) * EXCHANGE_RATES[currency];
      setPriceMmk(converted);
    } else {
      setPriceMmk(0);
    }
  }, [productPrice, currency]);

  // Get available banks for selected method
  const availableBanks = RATES
    .filter(rate => rate.method === method)
    .map(rate => rate.bank)
    .filter((bank, index, arr) => arr.indexOf(bank) === index);

  // Calculate loan
  const calculateLoan = () => {
    if (!priceMmk || priceMmk <= 0) return;

    // Find matching interest rate
    const rateData = RATES.find(
      rate => rate.term === term && rate.method === method && rate.bank === bank
    );

    if (!rateData) return;

    const principal = priceMmk;
    const interestRate = rateData.rate;
    const monthlyInterest = principal * interestRate;
    const monthlyRepayment = (principal / term) + monthlyInterest;
    const totalRepayment = monthlyRepayment * term;

    setResults({
      monthlyRepayment,
      totalRepayment,
      monthlyInterest,
      interestRate,
    });
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    calculateLoan();
  }, [term, method, bank, priceMmk]);

  // Reset bank when method changes
  useEffect(() => {
    const newAvailableBanks = RATES
      .filter(rate => rate.method === method)
      .map(rate => rate.bank)
      .filter((bank, index, arr) => arr.indexOf(bank) === index);
    
    if (newAvailableBanks.length > 0 && !newAvailableBanks.includes(bank)) {
      setBank(newAvailableBanks[0]);
    }
  }, [method, bank]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">PLUS+ Calculator</h1>
        <p className="text-muted-foreground">Loan calculation for product financing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Term Selection */}
            <div className="space-y-2">
              <Label htmlFor="term">Choose Term</Label>
              <Select value={term.toString()} onValueChange={(value) => setTerm(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Repayment Method */}
            <div className="space-y-2">
              <Label htmlFor="method">Choose Monthly Repayment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salary Deduction">Salary Deduction</SelectItem>
                  <SelectItem value="Cash Payment">Cash Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bank Option */}
            <div className="space-y-2">
              <Label htmlFor="bank">Bank Option</Label>
              <Select value={bank} onValueChange={setBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {availableBanks.map((bankOption) => (
                    <SelectItem key={bankOption} value={bankOption}>
                      {bankOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="SGD">SGD</SelectItem>
                  <SelectItem value="THB">THB</SelectItem>
                  <SelectItem value="MMK">MMK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Product Price in {currency}</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter product price"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
              />
            </div>

            {/* Price in MMK (Auto-calculated) */}
            <div className="space-y-2">
              <Label>Price in MMK</Label>
              <div className="p-3 bg-muted rounded-lg">
                <span className="text-lg font-semibold">
                  {formatCurrency(priceMmk)} MMK
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Calculation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Term</Label>
                <div className="text-lg font-semibold">{term} months</div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Interest Rate</Label>
                <div className="text-lg font-semibold">{(results.interestRate * 100).toFixed(2)}%</div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                <Label className="text-sm text-muted-foreground">Principal Amount</Label>
                <span className="font-semibold">{formatCurrency(priceMmk)} MMK</span>
              </div>
              
              <div className="flex justify-between items-center">
                <Label className="text-sm text-muted-foreground">Monthly Interest</Label>
                <span className="font-semibold">{formatCurrency(results.monthlyInterest)} MMK</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-t border-b bg-primary/5 rounded-lg px-3">
                <Label className="font-semibold">Monthly Repayment</Label>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(results.monthlyRepayment)} MMK
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <Label className="font-semibold">Total Repayment</Label>
                <span className="text-lg font-bold">
                  {formatCurrency(results.totalRepayment)} MMK
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <Label>Total Interest Paid</Label>
                <span>{formatCurrency(results.totalRepayment - priceMmk)} MMK</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoanCalculator;