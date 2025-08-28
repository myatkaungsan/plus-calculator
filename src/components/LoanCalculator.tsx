import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Business rules for interest rates
const getInterestRate = (term: number, method: string): number => {
  if (term === 3 || term === 6) {
    return method === 'Salary Deduction' ? 0.0376 : 0.041;
  } else if (term === 9 || term === 12) {
    return method === 'Salary Deduction' ? 0.0261 : 0.0279;
  }
  return 0;
};

// Business rules for admin fees
const getAdminFee = (priceMmk: number, method: string): number => {
  if (priceMmk <= 100000) {
    return method === 'Salary Deduction' ? 5000 : 5300;
  }
  return 0; // Can be expanded for other price ranges
};

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
  const [currency, setCurrency] = useState<string>('USD');
  const [productPrice, setProductPrice] = useState<string>('');
  const [priceMmk, setPriceMmk] = useState<number>(0);
  
  const [results, setResults] = useState({
    monthlyRepayment: 0,
    totalRepayment: 0,
    interestAmount: 0,
    adminFee: 0,
    interestRate: 0,
    minSalaryRequirement: 0,
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


  // Calculate loan based on business rules
  const calculateLoan = () => {
    if (!priceMmk || priceMmk <= 0) return;

    const principal = priceMmk;
    const interestRate = getInterestRate(term, method);
    const interestAmount = principal * interestRate;
    const adminFee = getAdminFee(priceMmk, method);
    const monthlyRepayment = (principal + interestAmount + adminFee) / term;
    const totalRepayment = monthlyRepayment * term;
    
    // Minimum salary requirement: 25% of monthly repayment
    const minSalaryRequirement = monthlyRepayment * 0.25;

    setResults({
      monthlyRepayment,
      totalRepayment,
      interestAmount,
      adminFee,
      interestRate,
      minSalaryRequirement,
    });
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    calculateLoan();
  }, [term, method, priceMmk]);

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
                  <SelectItem value="9">9 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
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
                  <SelectItem value="Yoma Bank Deduction">Yoma Bank Deduction</SelectItem>
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
                <Label className="text-sm text-muted-foreground">Interest Amount</Label>
                <span className="font-semibold">{formatCurrency(results.interestAmount)} MMK</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Admin Fee</Label>
                  <div className="text-xs text-muted-foreground">
                    {priceMmk <= 100000 ? 
                      `(≤100k MMK: ${method === 'Salary Deduction' ? '5,000' : '5,300'} MMK)` : 
                      '(No fee for >100k MMK)'
                    }
                  </div>
                </div>
                <span className="font-semibold">{formatCurrency(results.adminFee)} MMK</span>
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
                <Label>Total Interest + Fees</Label>
                <span>{formatCurrency(results.interestAmount + results.adminFee)} MMK</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-t bg-muted/30 rounded-lg px-3">
                <div className="space-y-1">
                  <Label className="font-semibold text-sm">Minimum Salary Required</Label>
                  <div className="text-xs text-muted-foreground">
                    (25% of Monthly Repayment)
                  </div>
                </div>
                <span className="text-lg font-bold text-accent-foreground">
                  {formatCurrency(results.minSalaryRequirement)} MMK
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoanCalculator;