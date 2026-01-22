import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trip, Expense } from '@/types';
import { exportExpensesToCSV, exportTripToCSV, printTripReport } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';

interface ExportMenuProps {
  trip: Trip;
  expenses: Expense[];
}

export function ExportMenu({ trip, expenses }: ExportMenuProps) {
  const { toast } = useToast();

  const handleExportExpensesCSV = () => {
    exportExpensesToCSV(expenses, trip.name);
    toast({
      title: 'Export complete',
      description: 'Expenses have been exported to CSV.',
    });
  };

  const handleExportTripCSV = () => {
    exportTripToCSV(trip, expenses);
    toast({
      title: 'Export complete',
      description: 'Trip report has been exported to CSV.',
    });
  };

  const handlePrintReport = () => {
    printTripReport(trip, expenses);
    toast({
      title: 'Print dialog opened',
      description: 'You can print or save as PDF.',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportExpensesCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Expenses (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportTripCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Full Report (CSV)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePrintReport}>
          <Printer className="mr-2 h-4 w-4" />
          Print / Save as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
