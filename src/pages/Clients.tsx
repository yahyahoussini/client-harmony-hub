import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Users, TrendingUp, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "active" | "archived";
  leadSource: string;
  totalBilled: string;
  lastActivity: string;
}

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Empty state - ready for backend binding
  const clients: Client[] = [];

  const stats = [
    {
      title: "Total Clients",
      value: "0",
      icon: Users,
      change: "+0%",
    },
    {
      title: "Active Clients",
      value: "0",
      icon: TrendingUp,
      change: "+0%",
    },
    {
      title: "Total Revenue",
      value: "$0",
      icon: DollarSign,
      change: "+0%",
    },
    {
      title: "Avg. Response Time",
      value: "0h",
      icon: Clock,
      change: "0%",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl animate-fade-in">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Clients
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your client relationships and track engagement
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
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
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="text-success font-medium">{stat.change}</span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg font-semibold">
                Client Directory
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-secondary p-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  No clients yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by adding your first client
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Lead Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Billed</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <Link
                            to={`/clients/${client.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {client.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {client.email}
                          </p>
                        </TableCell>
                        <TableCell>{client.company}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{client.leadSource}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              client.status === "active"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-muted text-muted-foreground"
                            )}
                            variant="outline"
                          >
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {client.totalBilled}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {client.lastActivity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
