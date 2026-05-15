import { Trip, Expense } from '@/types';
import { format } from 'date-fns';
import { getCountryByCode, getCurrencySymbol, expenseCategories } from '@/data/countries';

export function exportExpensesToCSV(expenses: Expense[], tripName: string): void {
  const headers = ['Date', 'Category', 'Description', 'Amount', 'Currency'];

  const rows = expenses.map((expense) => {
    const category = expenseCategories.find(c => c.value === expense.category)?.label || expense.category;
    return [
      format(new Date(expense.expenseDate), 'yyyy-MM-dd'),
      category,
      `"${expense.description.replace(/"/g, '""')}"`,
      expense.amount.toFixed(2),
      expense.currency,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadFile(csvContent, `${tripName.replace(/\s+/g, '_')}_expenses.csv`, 'text/csv');
}

export function exportTripToCSV(trip: Trip, expenses: Expense[]): void {
  const country = getCountryByCode(trip.destinationCountry);
  const currencySymbol = getCurrencySymbol(trip.currency);
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remaining = trip.budget - totalSpent;

  const tripSummary = [
    ['Trip Summary'],
    ['Name', trip.name],
    ['Destination', country?.name || trip.destinationCountry],
    ['Start Date', format(new Date(trip.startDate), 'yyyy-MM-dd')],
    ['End Date', format(new Date(trip.endDate), 'yyyy-MM-dd')],
    ['Total Budget', `${currencySymbol}${trip.budget}`],
    ['Total Spent', `${currencySymbol}${totalSpent.toFixed(2)}`],
    ['Remaining', `${currencySymbol}${remaining.toFixed(2)}`],
    [''],
    ['Expenses'],
    ['Date', 'Category', 'Description', 'Amount', 'Currency'],
  ];

  const expenseRows = expenses.map((expense) => {
    const category = expenseCategories.find(c => c.value === expense.category)?.label || expense.category;
    return [
      format(new Date(expense.expenseDate), 'yyyy-MM-dd'),
      category,
      `"${expense.description.replace(/"/g, '""')}"`,
      expense.amount.toFixed(2),
      expense.currency,
    ];
  });

  const csvContent = [...tripSummary, ...expenseRows]
    .map(row => row.join(','))
    .join('\n');

  downloadFile(csvContent, `${trip.name.replace(/\s+/g, '_')}_report.csv`, 'text/csv');
}

export function exportAllTripsToCSV(trips: Trip[]): void {
  const headers = ['Name', 'Destination', 'Start Date', 'End Date', 'Budget', 'Currency'];

  const rows = trips.map((trip) => {
    const country = getCountryByCode(trip.destinationCountry);
    return [
      `"${trip.name.replace(/"/g, '""')}"`,
      country?.name || trip.destinationCountry,
      format(new Date(trip.startDate), 'yyyy-MM-dd'),
      format(new Date(trip.endDate), 'yyyy-MM-dd'),
      trip.budget.toFixed(2),
      trip.currency,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadFile(csvContent, 'all_trips.csv', 'text/csv');
}

export function generateTripPDFContent(trip: Trip, expenses: Expense[]): string {
  const country = getCountryByCode(trip.destinationCountry);
  const currencySymbol = getCurrencySymbol(trip.currency);
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remaining = trip.budget - totalSpent;

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  return `
    <html>
      <head>
        <title>${trip.name} - Trip Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #004643; }
          .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .stat { display: inline-block; margin-right: 40px; }
          .stat-value { font-size: 24px; font-weight: bold; }
          .stat-label { color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #004643; color: white; }
          .category-breakdown { display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0; }
          .category-item { background: #f0f0f0; padding: 10px 15px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>${trip.name}</h1>
        <p>${country?.name} • ${format(new Date(trip.startDate), 'MMM d, yyyy')} - ${format(new Date(trip.endDate), 'MMM d, yyyy')}</p>

        <div class="summary">
          <div class="stat">
            <div class="stat-value">${currencySymbol}${Number(trip.budget).toLocaleString()}</div>
            <div class="stat-label">Total Budget</div>
          </div>
          <div class="stat">
            <div class="stat-value">${currencySymbol}${totalSpent.toLocaleString()}</div>
            <div class="stat-label">Total Spent</div>
          </div>
          <div class="stat">
            <div class="stat-value">${currencySymbol}${remaining.toLocaleString()}</div>
            <div class="stat-label">Remaining</div>
          </div>
        </div>

        <h2>Category Breakdown</h2>
        <div class="category-breakdown">
          ${Object.entries(categoryTotals).map(([cat, amount]) => {
            const catInfo = expenseCategories.find(c => c.value === cat);
            return `<div class="category-item">${catInfo?.icon} ${catInfo?.label}: ${currencySymbol}${(amount as number).toLocaleString()}</div>`;
          }).join('')}
        </div>

        <h2>Expenses</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(expense => {
              const catInfo = expenseCategories.find(c => c.value === expense.category);
              return `
                <tr>
                  <td>${format(new Date(expense.expenseDate), 'MMM d, yyyy')}</td>
                  <td>${catInfo?.icon} ${catInfo?.label}</td>
                  <td>${expense.description}</td>
                  <td>${currencySymbol}${Number(expense.amount).toLocaleString()}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

export function printTripReport(trip: Trip, expenses: Expense[]): void {
  const content = generateTripPDFContent(trip, expenses);
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.addEventListener('load', () => {
      printWindow.print();
      URL.revokeObjectURL(url);
    });
  } else {
    downloadFile(content, `${trip.name.replace(/\s+/g, '_')}_report.html`, 'text/html');
  }
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
