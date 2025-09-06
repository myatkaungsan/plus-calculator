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
  USD: 5500,
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
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [priceMmk, setPriceMmk] = useState<number>(0);
  const [depositMmk, setDepositMmk] = useState<number>(0);
  
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

  // Update MMK deposit when currency or deposit amount changes
  useEffect(() => {
    if (depositAmount && !isNaN(Number(depositAmount))) {
      const converted = Number(depositAmount) * EXCHANGE_RATES[currency];
      setDepositMmk(converted);
    } else {
      setDepositMmk(0);
    }
  }, [depositAmount, currency]);

  // Helper function to round down to nearest 1000 (4 digits)
  const roundDownToNearest1000 = (num: number): number => {
    return Math.floor(num / 1000) * 1000;
  };

  // Calculate based on new formula
  const calculateLoan = () => {
    if (!priceMmk || priceMmk <= 0) return;

    // Get annual interest rate and convert to monthly
    const annualRate = getDeductionRate(term, method);
    const monthlyRate = annualRate / 12;
    
    // New formula: Monthly repayment = (product_price - deposit_amount) * int_rate_price / (1 - ((1 + int_rate_price))^(-1 * term))
    // Where: product_price = priceMmk, deposit_amount = depositMmk, int_rate_price = monthlyRate, term = number of months
    let monthlyRepayment;
    const principal = priceMmk - depositMmk;
    
    if (monthlyRate === 0) {
      // If no interest, just divide principal by term
      monthlyRepayment = principal / term;
    } else {
      const denominator = 1 - Math.pow(1 + monthlyRate, -1 * term);
      monthlyRepayment = (principal * monthlyRate) / denominator;
    }
    
    // Previous PMT formula (commented out):
    // const numerator = priceMmk * monthlyRate * Math.pow(1 + monthlyRate, term);
    // const denominator = Math.pow(1 + monthlyRate, term) - 1;
    // monthlyRepayment = numerator / denominator;
    
    // Minimum salary = monthly repayment / 0.25
    const minSalaryRequirement = roundDownToNearest1000(monthlyRepayment / 0.25);
    
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
  }, [term, method, priceMmk, depositMmk]);

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
        <Card className="glass-card border-0 animate-fade-in animation-delay-200">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-white text-center">
              Loan Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Term Selection */}
            <div className="space-y-3">
              <Label htmlFor="term" className="text-sm font-semibold text-white">Choose Term</Label>
              <Select value={term.toString()} onValueChange={(value) => setTerm(Number(value))}>
                <SelectTrigger className="glass-input h-12 text-base text-white">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent className="glass-card border-0 backdrop-blur-xl">
                  <SelectItem value="3" className="text-base py-3 text-white">3 months</SelectItem>
                  <SelectItem value="6" className="text-base py-3 text-white">6 months</SelectItem>
                  <SelectItem value="9" className="text-base py-3 text-white">9 months</SelectItem>
                  <SelectItem value="12" className="text-base py-3 text-white">12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Repayment Method */}
            <div className="space-y-3">
              <Label htmlFor="method" className="text-sm font-semibold text-white">Choose Monthly Repayment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="glass-input h-12 text-base text-white">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="glass-card border-0 backdrop-blur-xl">
                  <SelectItem value="Salary Deduction" className="text-base py-3 text-white">Salary Deduction</SelectItem>
                  <SelectItem value="Yoma Bank Deduction" className="text-base py-3 text-white">Yoma Bank Deduction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div className="space-y-3">
              <Label htmlFor="currency" className="text-sm font-semibold text-white">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="glass-input h-12 text-base text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="glass-card border-0 backdrop-blur-xl">
                  {/* <SelectItem value="FX" className="text-base py-3 text-white">FX</SelectItem> */}
                  <SelectItem value="USD" className="text-base py-3 text-white">USD</SelectItem>
                  <SelectItem value="EUR" className="text-base py-3 text-white">EUR</SelectItem>
                  <SelectItem value="SGD" className="text-base py-3 text-white">SGD</SelectItem>
                  <SelectItem value="THB" className="text-base py-3 text-white">THB</SelectItem>
                  <SelectItem value="MMK" className="text-base py-3 text-white">MMK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Price */}
            <div className="space-y-3">
              <Label htmlFor="price" className="text-sm font-semibold text-white">Product Price in {currency}</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter product price"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="glass-input h-12 text-base placeholder:text-white/60 text-white"
              />
            </div>

            {/* Deposit Amount */}
            <div className="space-y-3">
              <Label htmlFor="deposit" className="text-sm font-semibold text-white">Deposit Amount in {currency}</Label>
              <Input
                id="deposit"
                type="number"
                placeholder="Enter deposit amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="glass-input h-12 text-base placeholder:text-white/60 text-white"
              />
            </div>

            {/* Price in MMK (Auto-calculated) */}
            {/* <div className="space-y-3">
              <Label className="text-sm font-semibold text-white">Price in MMK</Label>
              <div className="glass-input p-4 bg-gradient-to-r from-white/10 to-white/5 border border-white/30 hover-scale">
                <span className="text-lg font-bold text-white">
                  {formatCurrency(priceMmk)} MMK
                </span>
              </div>
            </div> */}
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="glass-card border-0 animate-fade-in animation-delay-400">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-white text-center">
              Calculation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-input p-4 text-center">
                <Label className="text-xs font-semibold text-white uppercase tracking-wider">Term</Label>
                <div className="text-xl font-bold text-white mt-1">{term} months</div>
              </div>
              <div className="glass-input p-4 text-center">
                <Label className="text-xs font-semibold text-white uppercase tracking-wider">Deduction Rate</Label>
                <div className="text-xl font-bold text-white mt-1">{(results.deductionRate * 100).toFixed(2)}%</div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="glass-input p-4 flex justify-between items-center hover-scale">
                <Label className="text-sm font-semibold text-white">Product Price (MMK)</Label>
                <span className="font-bold text-lg text-white">{formatCurrency(priceMmk)} MMK</span>
              </div>
              
              <div className="glass-input p-4 flex justify-between items-center hover-scale">
                <Label className="text-sm font-semibold text-white">Currency Rate</Label>
                <span className="font-bold text-lg text-white">{formatCurrency(EXCHANGE_RATES[currency])} MMK</span>
              </div>
              
              {/* <div className="glass-input p-4 flex justify-between items-center hover-scale">
                <Label className="text-sm font-semibold text-white">Deduction Amount</Label>
                <span className="font-bold text-lg text-white">{formatCurrency(results.deductionAmount)} MMK</span>
              </div> */}
              
              <div className="glass-input p-4 flex justify-between items-center hover-scale">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-white">Admin Fee</Label>
                  <div className="text-xs text-white/60">
                    {/* (Based on price range and method) */}
                  </div>
                </div>
                <span className="font-bold text-lg text-white">{formatCurrency(results.adminFee)} MMK</span>
              </div>
              
              <div className="glass-input p-6 bg-gradient-to-r from-white/15 to-white/10 border border-white/40 hover-scale">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Label className="font-bold text-lg text-white">Monthly Repayment</Label>
                    <div className="text-sm text-white/70">
                      {/* PMT Formula with {(results.deductionRate * 100).toFixed(2)}% annual rate */}
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-white">
                    {results.monthlyRepayment < 0 ? '-' : ''}{formatCurrency(Math.abs(results.monthlyRepayment))} MMK
                  </span>
                </div>
              </div>
              
              <div className="glass-input p-6 bg-gradient-to-r from-white/10 to-white/15 border border-white/40 hover-scale">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Label className="font-bold text-lg text-white">Minimum Salary Required</Label>
                    <div className="text-sm text-white/70">
                      {/* (Monthly Repayment ÷ 0.25, rounded down to nearest 1000) */}
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-white">
                    {formatCurrency(results.minSalaryRequirement)} MMK
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoanCalculator;