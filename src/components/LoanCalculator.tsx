import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Business rules for deduction rates
const getDeductionRate = (term: number, method: string): number => {
  if (term >= 3 && term <= 6) {
    return method === 'Salary Deduction' ? 0.0376 : 0.041;
  } else if (term >= 9 && term <= 12) {
    return method === 'Salary Deduction' ? 0.0261 : 0.0279;
  }
  return 0;
};

// Business rules for admin fees - expanded table
const getAdminFee = (priceMmk: number, method: string): number => {
  const adminFeeRanges = [
    { max: 100000, salary: 5000, yoma: 5300 },
    { max: 300000, salary: 8000, yoma: 8400 },
    { max: 500000, salary: 13500, yoma: 14200 },
    { max: 1000000, salary: 18500, yoma: 19500 },
    { max: 2000000, salary: 30000, yoma: 31500 },
    { max: 3000000, salary: 45000, yoma: 47300 },
    { max: 4000000, salary: 60000, yoma: 63000 },
    { max: 5000000, salary: 80000, yoma: 84000 },
    { max: 6000000, salary: 100000, yoma: 105000 },
    { max: 7000000, salary: 140000, yoma: 147000 },
    { max: 8000000, salary: 160000, yoma: 168000 },
    { max: 10000000, salary: 180000, yoma: 189000 },
    { max: 20000000, salary: 230000, yoma: 241500 },
    { max: Infinity, salary: 400000, yoma: 420000 },
  ];

  for (const range of adminFeeRanges) {
    if (priceMmk <= range.max) {
      return method === 'Salary Deduction' ? range.salary : range.yoma;
    }
  }
  return 0;
};

// Exchange rates
const EXCHANGE_RATES: Record<string, number> = {
  FX: 5500,
  USD: 6200,
  EUR: 6200,
  THB: 180,
  SGD: 4000,
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
    deductionAmount: 0,
    adminFee: 0,
    deductionRate: 0,
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

  // Helper function to round down to nearest 1000 (4 digits)
  const roundDownToNearest1000 = (num: number): number => {
    return Math.floor(num / 1000) * 1000;
  };

  // Calculate based on new business rules
  const calculateLoan = () => {
    if (!priceMmk || priceMmk <= 0) return;

    const currencyRate = EXCHANGE_RATES[currency];
    
    // New calculation: (Currency Rate × Term) - Product Price (MMK)
    const monthlyRepayment = (currencyRate * term) - priceMmk;
    
    // Minimum salary requirement: 25% of monthly repayment, rounded down to nearest 1000
    const minSalaryRequirement = monthlyRepayment > 0 
      ? roundDownToNearest1000(monthlyRepayment * 0.25)
      : 0;
    
    // Deduction calculation (based on MMK price)
    const deductionRate = getDeductionRate(term, method);
    const deductionAmount = priceMmk * deductionRate;
    
    // Admin fee (based on MMK price)
    const adminFee = getAdminFee(priceMmk, method);

    setResults({
      monthlyRepayment,
      deductionAmount,
      adminFee,
      deductionRate,
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
                  <SelectItem value="FX">FX</SelectItem>
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
                <Label className="text-sm text-muted-foreground">Deduction Rate</Label>
                <div className="text-lg font-semibold">{(results.deductionRate * 100).toFixed(2)}%</div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                <Label className="text-sm text-muted-foreground">Product Price (MMK)</Label>
                <span className="font-semibold">{formatCurrency(priceMmk)} MMK</span>
              </div>
              
              <div className="flex justify-between items-center">
                <Label className="text-sm text-muted-foreground">Currency Rate</Label>
                <span className="font-semibold">{formatCurrency(EXCHANGE_RATES[currency])} MMK</span>
              </div>
              
              <div className="flex justify-between items-center">
                <Label className="text-sm text-muted-foreground">Deduction Amount</Label>
                <span className="font-semibold">{formatCurrency(results.deductionAmount)} MMK</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Admin Fee</Label>
                  <div className="text-xs text-muted-foreground">
                    (Based on price range and method)
                  </div>
                </div>
                <span className="font-semibold">{formatCurrency(results.adminFee)} MMK</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-t border-b bg-primary/5 rounded-lg px-3">
                <div className="space-y-1">
                  <Label className="font-semibold">Monthly Repayment</Label>
                  <div className="text-xs text-muted-foreground">
                    ({formatCurrency(EXCHANGE_RATES[currency])} × {term}) - {formatCurrency(priceMmk)}
                  </div>
                </div>
                <span className={`text-lg font-bold ${results.monthlyRepayment < 0 ? 'text-destructive' : 'text-primary'}`}>
                  {results.monthlyRepayment < 0 ? '-' : ''}{formatCurrency(Math.abs(results.monthlyRepayment))} MMK
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-t bg-muted/30 rounded-lg px-3">
                <div className="space-y-1">
                  <Label className="font-semibold text-sm">Minimum Salary Required</Label>
                  <div className="text-xs text-muted-foreground">
                    (25% of Monthly Repayment, rounded down to nearest 1000)
                  </div>
                </div>
                <span className="text-lg font-bold text-accent-foreground">
                  {results.monthlyRepayment <= 0 ? 'Not Eligible' : `${formatCurrency(results.minSalaryRequirement)} MMK`}
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