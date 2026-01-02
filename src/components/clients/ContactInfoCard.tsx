import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Play,
  Pause,
  Mic,
  Upload,
  StopCircle,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  company: string;
  notes: string;
}

interface ContactInfoCardProps {
  contact?: ContactInfo;
  onUpdate?: (contact: ContactInfo) => void;
}

export function ContactInfoCard({ contact, onUpdate }: ContactInfoCardProps) {
  const [formData, setFormData] = useState<ContactInfo>(
    contact || {
      email: "",
      phone: "",
      address: "",
      company: "",
      notes: "",
    }
  );

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioProgress, setAudioProgress] = useState([0]);
  const [audioDuration, setAudioDuration] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof ContactInfo, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Fields */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="client@example.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company" className="text-xs font-medium text-muted-foreground">
              Company
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="Company name"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-medium text-muted-foreground">
              Address
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Street address, City, State, ZIP"
                className="min-h-[60px] resize-none pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes about this client..."
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        {/* Voice Notes Section */}
        <div className="mt-6 border-t pt-4">
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            Voice Notes
          </h4>

          {/* Audio Player */}
          <div className="rounded-lg bg-secondary/50 p-4">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="secondary"
                onClick={togglePlayback}
                className="h-10 w-10 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </Button>

              <div className="flex-1 space-y-1">
                <Slider
                  value={audioProgress}
                  onValueChange={setAudioProgress}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{currentTime}</span>
                  <span>{audioDuration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="mt-3 flex gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={toggleRecording}
              className="flex-1"
            >
              {isRecording ? (
                <>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Record Note
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadClick}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Audio
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
