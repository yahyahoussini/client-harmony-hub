import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Bell,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Plus,
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Clients",
      value: "0",
      change: "+0%",
      icon: Users,
      href: "/clients",
    },
    {
      title: "Open Invoices",
      value: "$0",
      change: "+0%",
      icon: FileText,
      href: "/invoices",
    },
    {
      title: "Pending Reminders",
      value: "0",
      change: "+0%",
      icon: Bell,
      href: "/reminders",
    },
    {
      title: "Revenue This Month",
      value: "$0",
      change: "+0%",
      icon: DollarSign,
      href: "/invoices",
    },
  ];

  const quickActions = [
    { label: "Add Client", icon: Users, href: "/clients" },
    { label: "Create Invoice", icon: FileText, href: "/invoices" },
    { label: "Set Reminder", icon: Bell, href: "/reminders" },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back! Here's an overview of your business
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.title} to={stat.href}>
              <Card className="transition-all hover:shadow-md hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 p-3">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="font-medium text-success">{stat.change}</span>
                    <span className="text-muted-foreground">from last month</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.href}>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-12"
                  >
                    <div className="rounded-md bg-primary/10 p-1.5">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    {action.label}
                    <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-secondary p-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  No recent activity
                </h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Start by adding clients and creating invoices to see your
                  activity stream here
                </p>
                <div className="mt-4 flex gap-3">
                  <Button asChild>
                    <Link to="/clients">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Client
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart Placeholder */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-muted/30">
              <div className="text-center">
                <DollarSign className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Revenue chart will display here once you have transaction data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
