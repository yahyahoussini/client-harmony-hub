import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit2, Check, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ClientHeaderProps {
  clientName: string;
  leadSource: string;
  status: "active" | "archived";
  onUpdate?: (data: { clientName?: string; leadSource?: string; status?: "active" | "archived" }) => void;
}

export function ClientHeader({
  clientName: initialName,
  leadSource: initialSource,
  status: initialStatus,
  onUpdate,
}: ClientHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [clientName, setClientName] = useState(initialName);
  const [leadSource, setLeadSource] = useState(initialSource);
  const [status, setStatus] = useState(initialStatus);

  const handleSave = () => {
    onUpdate?.({ clientName, leadSource, status });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setClientName(initialName);
    setLeadSource(initialSource);
    setStatus(initialStatus);
    setIsEditing(false);
  };

  return (
    <div className="mb-8 animate-fade-in">
      <Link
        to="/clients"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Clients
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {isEditing ? (
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="h-12 text-2xl font-bold w-80"
              placeholder="Client name"
            />
          ) : (
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {clientName}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Input
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                placeholder="Lead source"
                className="w-40"
              />
              <Select
                value={status}
                onValueChange={(value: "active" | "archived") => setStatus(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Button size="icon" variant="ghost" onClick={handleSave}>
                <Check className="h-4 w-4 text-success" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </>
          ) : (
            <>
              <Badge variant="secondary" className="text-xs font-medium">
                {leadSource}
              </Badge>
              <Badge
                variant={status === "active" ? "default" : "secondary"}
                className={
                  status === "active"
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
                }
              >
                {status === "active" ? "Active" : "Archived"}
              </Badge>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
