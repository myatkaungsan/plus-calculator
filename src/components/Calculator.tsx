import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operator);

      setDisplay(`${parseFloat(newValue.toFixed(7))}`);
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (firstValue: number, secondValue: number, operator: string) => {
    switch (operator) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEqual = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operator) {
      const newValue = calculate(previousValue, inputValue, operator);
      setDisplay(`${parseFloat(newValue.toFixed(7))}`);
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const formatDisplay = (value: string) => {
    if (value.length > 12) {
      return parseFloat(value).toExponential(6);
    }
    return value;
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-main rounded-3xl p-6 shadow-soft">
      {/* Display */}
      <div className="bg-calc-display rounded-2xl p-6 mb-6 shadow-button">
        <div className="text-right">
          <div className="text-4xl font-light text-foreground min-h-[3rem] flex items-center justify-end break-all">
            {formatDisplay(display)}
          </div>
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <Button
          variant="function"
          onClick={handleClear}
          className="col-span-2"
        >
          Clear
        </Button>
        <Button variant="function" onClick={() => {}}>
          ±
        </Button>
        <Button variant="operator" onClick={() => handleOperator('÷')}>
          ÷
        </Button>

        {/* Row 2 */}
        <Button variant="number" onClick={() => handleNumber('7')}>
          7
        </Button>
        <Button variant="number" onClick={() => handleNumber('8')}>
          8
        </Button>
        <Button variant="number" onClick={() => handleNumber('9')}>
          9
        </Button>
        <Button variant="operator" onClick={() => handleOperator('×')}>
          ×
        </Button>

        {/* Row 3 */}
        <Button variant="number" onClick={() => handleNumber('4')}>
          4
        </Button>
        <Button variant="number" onClick={() => handleNumber('5')}>
          5
        </Button>
        <Button variant="number" onClick={() => handleNumber('6')}>
          6
        </Button>
        <Button variant="operator" onClick={() => handleOperator('-')}>
          −
        </Button>

        {/* Row 4 */}
        <Button variant="number" onClick={() => handleNumber('1')}>
          1
        </Button>
        <Button variant="number" onClick={() => handleNumber('2')}>
          2
        </Button>
        <Button variant="number" onClick={() => handleNumber('3')}>
          3
        </Button>
        <Button variant="operator" onClick={() => handleOperator('+')}>
          +
        </Button>

        {/* Row 5 */}
        <Button
          variant="number"
          onClick={() => handleNumber('0')}
          className="col-span-2"
        >
          0
        </Button>
        <Button variant="number" onClick={handleDecimal}>
          .
        </Button>
        <Button variant="equals" onClick={handleEqual}>
          =
        </Button>
      </div>
    </div>
  );
};

export default Calculator;