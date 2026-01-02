import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ExternalLink, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface BillingSettings {
  recurringEnabled: boolean;
  amount: number;
  currency: string;
  cycle: string;
  nextPaymentDate: Date | undefined;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
}

interface BillingCardProps {
  billing?: BillingSettings;
  invoices?: Invoice[];
  onBillingUpdate?: (billing: {
    active?: boolean;
    amount?: number;
    currency?: string;
    cycle?: string;
    next_payment_date?: string;
  }) => void;
  onViewInvoice?: (invoiceId: string) => void;
}

const getStatusStyles = (status: Invoice["status"]) => {
  switch (status) {
    case "paid":
      return "bg-success/10 text-success border-success/20";
    case "overdue":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-warning/10 text-warning border-warning/20";
  }
};

export function BillingCard({
  billing: initialBilling,
  invoices = [],
  onBillingUpdate,
  onViewInvoice,
}: BillingCardProps) {
  const [billing, setBilling] = useState<BillingSettings>(
    initialBilling || {
      recurringEnabled: false,
      amount: 0,
      currency: "USD",
      cycle: "monthly",
      nextPaymentDate: undefined,
    }
  );

  // Sync with props when they change
  useEffect(() => {
    if (initialBilling) {
      setBilling(initialBilling);
    }
  }, [initialBilling]);

  const handleRecurringChange = (checked: boolean) => {
    setBilling(prev => ({ ...prev, recurringEnabled: checked }));
    onBillingUpdate?.({ active: checked });
  };

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setBilling(prev => ({ ...prev, amount }));
  };

  const handleAmountBlur = () => {
    onBillingUpdate?.({ amount: billing.amount });
  };

  const handleCurrencyChange = (value: string) => {
    setBilling(prev => ({ ...prev, currency: value }));
    onBillingUpdate?.({ currency: value });
  };

  const handleCycleChange = (value: string) => {
    setBilling(prev => ({ ...prev, cycle: value }));
    onBillingUpdate?.({ cycle: value });
  };

  const handleDateChange = (date: Date | undefined) => {
    setBilling(prev => ({ ...prev, nextPaymentDate: date }));
    if (date) {
      onBillingUpdate?.({ next_payment_date: date.toISOString() });
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          Billing & Subscriptions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subscription Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border bg-secondary/30 p-4">
            <div className="space-y-0.5">
              <Label
                htmlFor="recurring"
                className="text-sm font-medium cursor-pointer"
              >
                Recurring Billing
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically bill this client on a schedule
              </p>
            </div>
            <Switch
              id="recurring"
              checked={billing.recurringEnabled}
              onCheckedChange={handleRecurringChange}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
                Service Amount
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  value={billing.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  onBlur={handleAmountBlur}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="currency" className="text-xs font-medium text-muted-foreground">
                Currency
              </Label>
              <Select
                value={billing.currency}
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cycle" className="text-xs font-medium text-muted-foreground">
                Billing Cycle
              </Label>
              <Select
                value={billing.cycle}
                onValueChange={handleCycleChange}
              >
                <SelectTrigger id="cycle">
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Next Payment Due
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !billing.nextPaymentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {billing.nextPaymentDate
                      ? format(billing.nextPaymentDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={billing.nextPaymentDate}
                    onSelect={handleDateChange}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">
            Transaction History
          </h4>

          {invoices.length === 0 ? (
            <div className="rounded-lg border border-dashed py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No invoices yet
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-medium">Date</TableHead>
                    <TableHead className="text-xs font-medium">Amount</TableHead>
                    <TableHead className="text-xs font-medium">Status</TableHead>
                    <TableHead className="text-xs font-medium text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="text-sm">{invoice.date}</TableCell>
                      <TableCell className="text-sm font-medium">
                        ${invoice.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium capitalize",
                            getStatusStyles(invoice.status)
                          )}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewInvoice?.(invoice.id)}
                          className="h-8 px-2 text-xs"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
