
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Download, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Stream, StreamerType } from "@/lib/types";
import { detectStreamerType, isStreamlinkSupported } from "@/lib/api";

const CATEGORIES = [
  "Sports",
  "News",
  "Movies",
  "Entertainment",
  "Documentaries",
  "Kids",
  "Music",
  "Gaming",
  "Other",
];

const STREAMER_TYPES: { value: StreamerType; label: string }[] = [
  { value: "direct", label: "Direct URL" },
  { value: "youtube", label: "YouTube" },
  { value: "twitch", label: "Twitch" },
  { value: "dailymotion", label: "Dailymotion" },
  { value: "other", label: "Other" },
];

interface AdminStreamFormProps {
  stream?: Stream;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Stream>) => void;
}

export function AdminStreamForm({
  stream,
  open,
  onClose,
  onSave,
}: AdminStreamFormProps) {
  const isEdit = !!stream;
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<Partial<Stream>>({
    defaultValues: {
      name: stream?.name || "",
      url: stream?.url || "",
      category: stream?.category || "Other",
      logo: stream?.logo || "",
      isActive: stream?.isActive !== false,
      useStreamlink: stream?.useStreamlink || false,
      streamerType: stream?.streamerType || "direct",
    },
  });
  
  const url = watch("url");
  const category = watch("category");
  const logo = watch("logo");
  const useStreamlink = watch("useStreamlink");
  const streamerType = watch("streamerType");
  
  const [streamlinkSupported, setStreamlinkSupported] = useState(false);
  
  // Update streamlink support status when URL changes
  useEffect(() => {
    if (url) {
      const supported = isStreamlinkSupported(url);
      setStreamlinkSupported(supported);
      
      // If the URL suggests a specific streamer type and it's different from the current one
      if (supported) {
        const detectedType = detectStreamerType(url);
        if (detectedType !== streamerType) {
          setValue("streamerType", detectedType);
        }
      }
    } else {
      setStreamlinkSupported(false);
    }
  }, [url, streamerType, setValue]);
  
  useEffect(() => {
    if (open) {
      reset({
        name: stream?.name || "",
        url: stream?.url || "",
        category: stream?.category || "Other",
        logo: stream?.logo || "",
        isActive: stream?.isActive !== false,
        useStreamlink: stream?.useStreamlink || false,
        streamerType: stream?.streamerType || "direct",
      });
      
      // Check streamlink support for initial URL
      if (stream?.url) {
        setStreamlinkSupported(isStreamlinkSupported(stream.url));
      }
    }
  }, [open, stream, reset]);
  
  const onSubmit = (data: Partial<Stream>) => {
    onSave({
      ...data,
      id: stream?.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Stream" : "Add New Stream"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Make changes to the stream details below."
              : "Enter the details for the new stream."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Stream Name</Label>
              <Input
                id="name"
                placeholder="Enter stream name"
                {...register("name", { required: true })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">Stream URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/stream"
                {...register("url", { required: true })}
              />
              {streamlinkSupported && (
                <div className="text-xs text-primary flex items-center gap-1 mt-1">
                  <Download className="h-3 w-3" />
                  Streamlink supported for this URL
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="useStreamlink"
                  checked={useStreamlink}
                  onCheckedChange={(checked) => setValue("useStreamlink", checked)}
                  disabled={!streamlinkSupported}
                />
                <div className="flex items-center gap-2">
                  <Label htmlFor="useStreamlink">Use Streamlink</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ExternalLink className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Streamlink extracts the stream from platforms like YouTube and Twitch. Requires a backend service running Streamlink.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              {useStreamlink && (
                <div className="space-y-2">
                  <Label htmlFor="streamerType">Streamer Type</Label>
                  <Select
                    value={streamerType}
                    onValueChange={(value) => setValue("streamerType", value as StreamerType)}
                  >
                    <SelectTrigger id="streamerType">
                      <SelectValue placeholder="Select streamer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {STREAMER_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL (Optional)</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="logo"
                    placeholder="https://example.com/logo.png"
                    {...register("logo")}
                  />
                </div>
                {logo && (
                  <div className="relative h-10 w-10 overflow-hidden rounded border">
                    <img
                      src={logo}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-5 w-5 rounded-full bg-background/80"
                      type="button"
                      onClick={() => setValue("logo", "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={watch("isActive")}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
