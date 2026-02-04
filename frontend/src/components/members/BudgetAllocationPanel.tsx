import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MemberBudget } from '@/types';
import { DollarSign, AlertTriangle } from 'lucide-react';

interface BudgetAllocationPanelProps {
  tripId: string;
  tripTotalBudget: number;
  members: MemberBudget[];
  isOwner: boolean;
  onUpdate: () => void;
}

export function BudgetAllocationPanel({
  tripId,
  tripTotalBudget,
  members: initialMembers,
  isOwner,
  onUpdate,
}: BudgetAllocationPanelProps) {
  const [members, setMembers] = useState(initialMembers);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const totalAllocated = members.reduce((sum, m) => sum + m.allocatedBudget, 0);
  const isValidAllocation = Math.abs(totalAllocated - tripTotalBudget) < 0.01;

  const updateAllocation = (userId: string, amount: number) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.userId === userId ? { ...m, allocatedBudget: amount } : m
      )
    );
  };

  const handleSave = async () => {
    if (!isValidAllocation) {
      toast({
        title: 'Invalid allocation',
        description: `Total must equal trip budget (${tripTotalBudget})`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const allocations = members.map((m) => ({
        userId: m.userId,
        allocatedBudget: m.allocatedBudget,
      }));

      const response = await fetch(`/api/trips/${tripId}/allocate-budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ allocations }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save allocations');
      }

      toast({
        title: 'Budgets updated',
        description: 'Member budgets have been saved',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update budgets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Budget Allocation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {members.map((member) => (
          <div key={member.userId} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.user.avatar} />
                  <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{member.user.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor={`budget-${member.userId}`} className="sr-only">
                  Budget for {member.user.name}
                </Label>
                <Input
                  id={`budget-${member.userId}`}
                  type="number"
                  value={member.allocatedBudget}
                  onChange={(e) => updateAllocation(member.userId, Number(e.target.value))}
                  className="w-32"
                  disabled={!isOwner}
                  min={0}
                  step="0.01"
                />
                <span className="text-sm text-muted-foreground w-32">
                  Spent: {member.spentAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="ml-11">
              <Progress
                value={(member.spentAmount / member.allocatedBudget) * 100}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {member.remainingBudget.toFixed(2)} remaining
              </p>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Total Allocated:</span>
            <span
              className={`font-bold ${
                isValidAllocation ? 'text-green-600' : 'text-destructive'
              }`}
            >
              {totalAllocated.toFixed(2)} / {tripTotalBudget.toFixed(2)}
            </span>
          </div>
          {!isValidAllocation && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>Allocation must match trip total budget</span>
            </div>
          )}
        </div>

        {isOwner && (
          <Button
            onClick={handleSave}
            disabled={loading || !isValidAllocation}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Save Budget Allocation'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
