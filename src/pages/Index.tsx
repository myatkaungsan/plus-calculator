import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Calculator from '@/components/Calculator';
import LoanCalculator from '@/components/LoanCalculator';

const Index = () => {
  const [activeCalculator, setActiveCalculator] = useState<'basic' | 'loan'>('loan');

  return (
    <div className="min-h-screen bg-gradient-main p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-1">
            <Button
              variant={activeCalculator === 'basic' ? 'default' : 'ghost'}
              onClick={() => setActiveCalculator('basic')}
              className="px-6"
            >
              Basic Calculator
            </Button>
            <Button
              variant={activeCalculator === 'loan' ? 'default' : 'ghost'}
              onClick={() => setActiveCalculator('loan')}
              className="px-6"
            >
              PLUS+ Calculator
            </Button>
          </div>
        </div>

        {/* Calculator Content */}
        {activeCalculator === 'basic' ? (
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Smart Calculator</h1>
                <p className="text-muted-foreground">Beautiful & functional calculator</p>
              </div>
              <Calculator />
            </div>
          </div>
        ) : (
          <LoanCalculator />
        )}
      </div>
    </div>
  );
};

export default Index;
