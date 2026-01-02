import { useState, useRef, useCallback } from "react";
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
import { Asset } from "@/types/database";
import { toast } from "sonner";

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  company: string;
  notes: string;
}

interface ContactInfoCardProps {
  contact?: ContactInfo;
  voiceNotes?: Asset[];
  onUpdate?: (contact: Partial<ContactInfo>) => void;
  onAudioUpload?: (blob: Blob, fileName: string) => void;
}

export function ContactInfoCard({ 
  contact, 
  voiceNotes = [],
  onUpdate,
  onAudioUpload 
}: ContactInfoCardProps) {
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
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioProgress, setAudioProgress] = useState([0]);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (field: keyof ContactInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof ContactInfo) => {
    if (onUpdate && formData[field] !== contact?.[field]) {
      onUpdate({ [field]: formData[field] });
    }
  };

  const togglePlayback = useCallback((noteId: string, fileUrl: string) => {
    if (isPlaying === noteId) {
      audioRef.current?.pause();
      setIsPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(fileUrl);
      audioRef.current.play();
      audioRef.current.onended = () => setIsPlaying(null);
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setAudioProgress([progress]);
        }
      };
      setIsPlaying(noteId);
    }
  }, [isPlaying]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const fileName = `voice-note-${Date.now()}.webm`;
        
        if (onAudioUpload) {
          onAudioUpload(blob, fileName);
        }

        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.info("Recording started...");
    } catch (error) {
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      toast.success("Recording saved!");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAudioUpload) {
      onAudioUpload(file, file.name);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
                onBlur={() => handleBlur("email")}
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
                onBlur={() => handleBlur("phone")}
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
                onBlur={() => handleBlur("company")}
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
                onBlur={() => handleBlur("address")}
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
              onBlur={() => handleBlur("notes")}
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

          {/* Existing Voice Notes List */}
          {voiceNotes.length > 0 && (
            <div className="space-y-2 mb-4">
              {voiceNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3"
                >
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => togglePlayback(note.id, note.file_url)}
                    className="h-8 w-8 rounded-full flex-shrink-0"
                  >
                    {isPlaying === note.id ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3 ml-0.5" />
                    )}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{note.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Audio Player (for currently playing) */}
          {isPlaying && (
            <div className="rounded-lg bg-secondary/50 p-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <Slider
                    value={audioProgress}
                    onValueChange={(value) => {
                      setAudioProgress(value);
                      if (audioRef.current) {
                        audioRef.current.currentTime = (value[0] / 100) * audioRef.current.duration;
                      }
                    }}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={toggleRecording}
              className="flex-1"
            >
              {isRecording ? (
                <>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop ({formatTime(recordingTime)})
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
              disabled={isRecording}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Audio
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
