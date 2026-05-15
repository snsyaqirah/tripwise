import { useState, useEffect } from 'react';
import { Expense, CreateExpenseInput, ExpenseCategory, CreateSubItemInput } from '@/types';
import { expenseCategories, currencies } from '@/data/countries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  tripStartDate: string;
  tripEndDate: string;
  expense?: Expense;
  onSubmit: (data: CreateExpenseInput) => Promise<void>;
}

interface FormErrors {
  category?: string;
  amount?: string;
  date?: string;
  description?: string;
}

const SUB_ITEM_CATEGORIES = expenseCategories.filter(c => c.value !== 'bundle');

export function ExpenseForm({
  open,
  onOpenChange,
  tripId,
  tripStartDate,
  tripEndDate,
  expense,
  onSubmit,
}: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [subItems, setSubItems] = useState<CreateSubItemInput[]>([]);

  const [formData, setFormData] = useState<CreateExpenseInput>({
    tripId,
    category: 'food',
    amount: 0,
    currency: 'USD',
    date: '',
    description: '',
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        tripId: expense.tripId,
        category: expense.category,
        amount: expense.amount,
        currency: expense.currency,
        date: expense.expenseDate,
        description: expense.description,
      });
      setSubItems(
        expense.subItems?.map(s => ({
          description: s.description,
          amount: s.amount,
          category: s.category,
        })) ?? []
      );
    } else {
      setFormData({
        tripId,
        category: 'food',
        amount: 0,
        currency: 'USD',
        date: '',
        description: '',
      });
      setSubItems([]);
    }
    setErrors({});
  }, [expense, tripId, open]);

  const isBundle = formData.category === 'bundle';

  const addSubItem = () => {
    setSubItems(prev => [...prev, { description: '', amount: 0, category: undefined }]);
  };

  const removeSubItem = (index: number) => {
    setSubItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateSubItem = (index: number, field: keyof CreateSubItemInput, value: string | number | ExpenseCategory) => {
    setSubItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const expenseDate = new Date(formData.date);
      if (expenseDate < new Date(tripStartDate) || expenseDate > new Date(tripEndDate)) {
        newErrors.date = `Date must be within trip period (${tripStartDate} - ${tripEndDate})`;
      }
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        subItems: isBundle && subItems.length > 0 ? subItems : undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {expense ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
          <DialogDescription>
            {expense ? 'Update the expense details below.' : 'Record a new expense for this trip.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as ExpenseCategory }))}
            >
              <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover">
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              min={tripStartDate}
              max={tripEndDate}
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className={errors.date ? 'border-destructive' : ''}
            />
            {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="What was this expense for?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`resize-none ${errors.description ? 'border-destructive' : ''}`}
              rows={2}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Sub-items (only for bundle category) */}
          {isBundle && (
            <div className="space-y-3 border border-border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  🎁 Bundle breakdown <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={addSubItem}>
                  <Plus className="h-3 w-3 mr-1" /> Add item
                </Button>
              </div>

              {subItems.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Break down this package into individual items — e.g. flight, hotel, tour.
                </p>
              )}

              {subItems.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateSubItem(index, 'description', e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={item.amount || ''}
                    onChange={(e) => updateSubItem(index, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-24 text-sm"
                  />
                  <Select
                    value={item.category ?? ''}
                    onValueChange={(v) => updateSubItem(index, 'category', v as ExpenseCategory)}
                  >
                    <SelectTrigger className="w-32 text-xs">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {SUB_ITEM_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value} className="text-xs">
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeSubItem(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {subItems.length > 0 && (
                <p className="text-xs text-muted-foreground text-right">
                  Items total: {formData.currency} {subItems.reduce((s, i) => s + (i.amount || 0), 0).toFixed(2)}
                  {' '}/ Package total: {formData.currency} {(formData.amount || 0).toFixed(2)}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : expense ? 'Update Expense' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
