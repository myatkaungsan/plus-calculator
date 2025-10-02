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
  const [currency, setCurrency] = useState<string>('MMK');
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
  // useEffect(() => {
  //   if (depositAmount && !isNaN(Number(depositAmount))) {
  //     const converted = Number(depositAmount) * EXCHANGE_RATES[currency];
  //     setDepositMmk(converted);
  //   } else {
  //     setDepositMmk(0);
  //   }
  // }, [depositAmount, currency]);

  // Update deposit MMK when deposit % or product price changes
useEffect(() => {
  if (depositAmount && !isNaN(Number(depositAmount))) {
    const percent = Number(depositAmount) / 100;
    const converted = priceMmk * percent; // % of product price in MMK
    setDepositMmk(converted);
  } else {
    setDepositMmk(0);
  }
}, [depositAmount, priceMmk]);


  // Helper function to round down to nearest 1000 (4 digits)
  const roundDownToNearest1000 = (num: number): number => {
    return Math.floor(num / 1000) * 1000;
  };

  const pmt = (rate: number, nper: number, pv: number) => {
  // rate should be a decimal per-period rate (e.g. 0.0376)
  if (nper === 0) return 0;
  if (rate === 0) return pv / nper;
  return (pv * rate) / (1 - Math.pow(1 + rate, -nper));
};


  // Calculate based on new formula
  const calculateLoan = () => {
    if (!priceMmk || priceMmk <= 0) {
      setResults((r) => ({ ...r, monthlyRepayment: 0, deductionAmount: 0, adminFee: 0, deductionRate: 0, minSalaryRequirement: 0 }));
      return;
    }

    const adminFee = getAdminFee(priceMmk, method);
    const principal = Math.max(0, priceMmk - depositMmk); // amount to finance
    const deductionRate = getDeductionRate(term, method); // decimal per-period rate

    // Use PMT for both methods (user requested PMT for both)
    const monthlyRepayment = pmt(deductionRate, term, principal);

    const totalPaid = monthlyRepayment * term;
    // total interest (excluding admin fee) = totalPaid - principal - adminFee
    const totalInterest = Math.max(0, totalPaid - principal - adminFee);

    const minSalaryRequirement = roundDownToNearest1000(monthlyRepayment / 0.20);
    

    setResults({
      monthlyRepayment,
      deductionAmount: totalInterest,
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
     <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center title-card">
        <h1 className="text-4xl font-bold text-foreground mb-4">PLUS+ Calculator</h1>
        {/* <p className="text-muted-foreground text-lg">Advanced loan calculation for product financing</p> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="glass-card border-0"> {/* animate-fade-in animation-delay-200 hover-scale */}
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              BNPL Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Term Selection */}
            <div className="space-y-4 group">
              <Label htmlFor="term" className="text-sm font-semibold text-foreground">
                Choose Term
              </Label>
              <Select value={term.toString()} onValueChange={(value) => setTerm(Number(value))}>
                <SelectTrigger className="glass-input h-14 text-base text-foreground border-2 border-transparent hover:border-primary/30 transition-all duration-300">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent className="glass-card border-0 backdrop-blur-xl shadow-2xl">
                  <SelectItem value="3" className="text-base py-4 text-foreground hover:bg-primary/10 rounded-lg m-1">3 months</SelectItem>
                  <SelectItem value="6" className="text-base py-4 text-foreground hover:bg-primary/10 rounded-lg m-1">6 months</SelectItem>
                  <SelectItem value="9" className="text-base py-4 text-foreground hover:bg-primary/10 rounded-lg m-1">9 months</SelectItem>
                  <SelectItem value="12" className="text-base py-4 text-foreground hover:bg-primary/10 rounded-lg m-1">12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Repayment Method */}
            <div className="space-y-4 group">
              <Label htmlFor="method" className="text-sm font-semibold text-foreground">
                Choose Monthly Repayment Method
              </Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="glass-input h-14 text-base text-foreground border-2 border-transparent hover:border-secondary/30 transition-all duration-300">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="glass-card border-0 backdrop-blur-xl shadow-2xl">
                  <SelectItem value="Salary Deduction" className="text-base py-4 text-foreground hover:bg-secondary/10 rounded-lg m-1">Salary Deduction</SelectItem>
                  <SelectItem value="Yoma Bank Deduction" className="text-base py-4 text-foreground hover:bg-secondary/10 rounded-lg m-1">Yoma Bank Deduction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div className="space-y-4 group">
              <Label htmlFor="currency" className="text-sm font-semibold text-foreground">
                Currency
              </Label>
              
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="glass-input h-14 text-base text-foreground border-2 border-transparent hover:border-accent/30 transition-all duration-300">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="glass-card border-0 backdrop-blur-xl shadow-2xl">
                  <SelectItem value="MMK" className="text-base py-4 text-foreground hover:bg-accent/10 rounded-lg m-1">MMK</SelectItem>
                  {/* <SelectItem value="USD" className="text-base py-4 text-foreground hover:bg-accent/10 rounded-lg m-1">USD</SelectItem>
                  <SelectItem value="EUR" className="text-base py-4 text-foreground hover:bg-accent/10 rounded-lg m-1">EUR</SelectItem>
                  <SelectItem value="SGD" className="text-base py-4 text-foreground hover:bg-accent/10 rounded-lg m-1">SGD</SelectItem>
                  <SelectItem value="THB" className="text-base py-4 text-foreground hover:bg-accent/10 rounded-lg m-1">THB</SelectItem> */}
                  
                </SelectContent>
              </Select>
            </div>

           {/* Deposit Selection */}
{/* Deposit Selection */}
<div className="space-y-4 group">
  <Label htmlFor="deposit" className="text-sm font-semibold text-foreground">
    Deposit (% of Product Price)
  </Label>
  <Select
    value={depositAmount}
    onValueChange={(value) => {
      setDepositAmount(value); // store percentage string
    }}
  >
    <SelectTrigger className="glass-input h-14 text-base text-foreground border-2 border-transparent hover:border-primary/30 transition-all duration-300">
      <SelectValue placeholder="Select deposit %" />
    </SelectTrigger>
    <SelectContent className="glass-card border-0 backdrop-blur-xl shadow-2xl">
      {[0,5,10,15, 20,25, 30,35, 40,45, 50, 55,60,65, 70].map((percent) => (
        <SelectItem key={percent} value={percent.toString()}>
          {percent}%
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* Show Deposit Value in MMK */}
  {depositMmk > 0 && (
    <div className="glass-input p-4 flex justify-between items-center border-2 border-transparent hover:border-primary/20 transition-all duration-300">
      <span className="text-sm font-semibold text-foreground">
        Total Deposit Amount
      </span>
      <span className="text-base font-bold text-foreground">
        {formatCurrency(depositMmk)} MMK
      </span>
    </div>
  )}
</div>


            {/* Product Price */}
            <div className="space-y-4 group">
              <Label htmlFor="price" className="text-sm font-semibold text-foreground">
                Product Price in {currency}
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter product price"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  className="glass-input h-14 text-base placeholder:text-muted-foreground text-foreground border-2 border-transparent hover:border-primary/30 focus:border-primary/50 transition-all duration-300 pl-16"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-semibold">
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency}
                </span>
              </div>
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
         <Card className="glass-card border-0">  {/*animate-fade-in animation-delay-400 hover-scale */}
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Calculation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            

            <div className="space-y-6">
              <div className="glass-input p-6 flex justify-between items-center group border-2 border-transparent hover:border-accent/20 transition-all duration-300">
                <Label className="text-base font-bold text-foreground">Product Price (MMK)</Label>
                <span className="font-bold text-xl text-foreground">{formatCurrency(priceMmk)} MMK</span>
              </div>
              
             
              <div className="glass-input p-6 flex justify-between items-center group border-2 border-transparent hover:border-primary/20 transition-all duration-300">
                <div>
                  <Label className="text-base font-bold text-foreground block">Admin Fee</Label>
                </div>
                <span className="font-bold text-xl text-foreground">{formatCurrency(results.adminFee)} MMK</span>
              </div>
              
              <div className="glass-input p-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-50"></div>
                <div className="relative flex justify-between items-center">
                  <div className="space-y-3">
                    <Label className="font-bold text-base text-foreground">Monthly Repayment</Label>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-foreground block">
                      {results.monthlyRepayment < 0 ? '-' : ''}{formatCurrency(Math.abs(results.monthlyRepayment))}
                    </span>
                    <span className="text-lg text-muted-foreground font-medium">MMK</span>
                  </div>
                </div>
              </div>
              
              <div className="glass-input p-8 bg-gradient-to-r from-secondary/5 to-primary/5 border-2 border-secondary/20 hover:border-secondary/40 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-primary/5 opacity-50"></div>
                <div className="relative flex justify-between items-center">
                  <div className="space-y-3">
                    <Label className="font-bold text-base text-foreground">Minimum Salary Required</Label>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-foreground block">
                      {formatCurrency(results.minSalaryRequirement)}
                    </span>
                    <span className="text-lg text-muted-foreground font-medium">MMK</span>
                  </div>
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
