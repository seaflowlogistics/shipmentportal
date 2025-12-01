import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Card, CardBody } from './Card';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface DateRangePickerProps {
  onApply: (period: 'today' | 'week' | 'month' | 'year' | 'custom', dateFrom?: string, dateTo?: string) => void;
  onClear: () => void;
  isOpen: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ onApply, onClear, isOpen }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handlePeriodClick = (period: 'today' | 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
    onApply(period);
  };

  const handleCustomDateApply = () => {
    if (dateFrom && dateTo) {
      if (new Date(dateFrom) > new Date(dateTo)) {
        alert('Start date must be before end date');
        return;
      }
      onApply('custom', dateFrom, dateTo);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Filter by Date</h3>
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <CardBody className="space-y-6">
          {/* Quick Filters */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Filters</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant={selectedPeriod === 'today' ? 'primary' : 'secondary'}
                onClick={() => handlePeriodClick('today')}
                className="w-full"
              >
                Today
              </Button>
              <Button
                size="sm"
                variant={selectedPeriod === 'week' ? 'primary' : 'secondary'}
                onClick={() => handlePeriodClick('week')}
                className="w-full"
              >
                This Week
              </Button>
              <Button
                size="sm"
                variant={selectedPeriod === 'month' ? 'primary' : 'secondary'}
                onClick={() => handlePeriodClick('month')}
                className="w-full"
              >
                This Month
              </Button>
              <Button
                size="sm"
                variant={selectedPeriod === 'year' ? 'primary' : 'secondary'}
                onClick={() => handlePeriodClick('year')}
                className="w-full"
              >
                This Year
              </Button>
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Custom Range</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">From</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="Start date"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">To</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="End date"
                />
              </div>
              <Button
                onClick={handleCustomDateApply}
                disabled={!dateFrom || !dateTo}
                className="w-full"
              >
                Apply Custom Range
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-4 flex gap-2">
            <Button
              variant="secondary"
              onClick={onClear}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onClear}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
