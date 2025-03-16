
import React, { useState, useEffect } from "react";
import { X, Save, Trash2, Link, Image, Info, Globe, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// Import from types.js
import { detectStreamerType, isStreamlinkSupported } from "@/lib/api";

/**
 * @typedef {'direct' | 'youtube' | 'twitch' | 'dailymotion' | 'other'} StreamerType
 */

const CATEGORIES = [
  "Sports",
  "News",
  "Entertainment",
  "Movies",
  "Music",
  "Documentary",
  "Kids",
  "Science",
  "Lifestyle",
  "Other"
];

const DEFAULT_STREAM = {
  name: "",
  url: "",
  category: "Other",
  logo: "",
  isActive: true,
  useStreamlink: false,
  streamerType: "direct",
  streamlinkOptions: {
    quality: "best",
    useProxy: false,
    secureTokenEnabled: false,
    customArgs: "",
    useUserAgent: false,
    userAgent: ""
  }
};

/**
 * AdminStreamForm component for adding/editing IPTV streams
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Function} props.onSave - Function to call when stream is saved
 * @param {Object} [props.stream] - Stream to edit (undefined for new stream)
 */
export const AdminStreamForm = ({ stream, open, onClose, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState(DEFAULT_STREAM);
  const [loading, setLoading] = useState(false);
  const [urlTested, setUrlTested] = useState(false);
  const [streamerTypeDetected, setStreamerTypeDetected] = useState(false);
  
  // Reset form when dialog opens/closes or stream changes
  useEffect(() => {
    if (open) {
      if (stream) {
        // Editing existing stream
        setFormData({
          ...DEFAULT_STREAM,
          ...stream,
          streamlinkOptions: {
            ...DEFAULT_STREAM.streamlinkOptions,
            ...(stream.streamlinkOptions || {})
          }
        });
        setStreamerTypeDetected(true);
      } else {
        // Creating new stream
        setFormData(DEFAULT_STREAM);
        setStreamerTypeDetected(false);
      }
      setUrlTested(false);
    }
  }, [open, stream]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "url" && urlTested) {
      setUrlTested(false);
      setStreamerTypeDetected(false);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleStreamlinkOptionsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      streamlinkOptions: {
        ...prev.streamlinkOptions,
        [name]: type === "checkbox" ? checked : value
      }
    }));
  };
  
  const handleStreamlinkSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      streamlinkOptions: {
        ...prev.streamlinkOptions,
        [name]: checked
      }
    }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stream name",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stream URL",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving stream:", error);
      toast({
        title: "Error",
        description: "Failed to save stream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const detectType = async () => {
    if (!formData.url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stream URL",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const type = await detectStreamerType(formData.url);
      
      setFormData(prev => ({
        ...prev,
        streamerType: type,
        useStreamlink: isStreamlinkSupported(type)
      }));
      
      setStreamerTypeDetected(true);
      setUrlTested(true);
      
      toast({
        title: "Success",
        description: `Detected stream type: ${type}`,
      });
    } catch (error) {
      console.error("Error detecting stream type:", error);
      toast({
        title: "Error",
        description: "Failed to detect stream type. Using direct as fallback.",
        variant: "destructive",
      });
      
      setFormData(prev => ({
        ...prev,
        streamerType: "direct",
        useStreamlink: false
      }));
    } finally {
      setLoading(false);
    }
  };
  
  const getStreamerTypeLabel = (type) => {
    switch (type) {
      case "youtube": return "YouTube";
      case "twitch": return "Twitch";
      case "dailymotion": return "Dailymotion";
      case "direct": return "Direct Stream";
      default: return "Other";
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">
              {stream ? "Edit Stream" : "Add New Stream"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Stream Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter stream name"
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="url">Stream URL</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={detectType}
                    disabled={loading}
                    className="flex items-center gap-1 text-xs h-7 px-2"
                  >
                    {loading ? "Detecting..." : "Detect Type"}
                    {urlTested && streamerTypeDetected && (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    )}
                  </Button>
                </div>
                <Input
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://example.com/stream"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="logo">Logo URL (optional)</Label>
                <Input
                  id="logo"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="isActive">Active</Label>
                  <span className="text-sm text-muted-foreground">
                    Enable or disable this stream
                  </span>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
                />
              </div>
            </div>
            
            {/* Stream Type and Streamlink Settings */}
            <Accordion type="single" collapsible defaultValue="streamType">
              <AccordionItem value="streamType">
                <AccordionTrigger>Stream Type Settings</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="streamerType">Stream Type</Label>
                      <Select
                        value={formData.streamerType}
                        onValueChange={(value) => {
                          handleSelectChange("streamerType", value);
                          const supportsStreamlink = isStreamlinkSupported(value);
                          handleSwitchChange("useStreamlink", supportsStreamlink);
                        }}
                      >
                        <SelectTrigger id="streamerType">
                          <SelectValue placeholder="Select stream type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="direct">Direct Stream</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="twitch">Twitch</SelectItem>
                          <SelectItem value="dailymotion">Dailymotion</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="useStreamlink">
                          Use Streamlink
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 h-4 ml-1 inline text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Process stream through Streamlink for better compatibility</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          Recommended for {getStreamerTypeLabel(formData.streamerType)} streams
                        </span>
                      </div>
                      <Switch
                        id="useStreamlink"
                        checked={formData.useStreamlink}
                        onCheckedChange={(checked) => handleSwitchChange("useStreamlink", checked)}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {formData.useStreamlink && (
                <AccordionItem value="streamlinkOptions">
                  <AccordionTrigger>Streamlink Options</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="quality">Quality</Label>
                        <Select
                          value={formData.streamlinkOptions.quality}
                          onValueChange={(value) => 
                            handleSelectChange("streamlinkOptions.quality", value)
                          }
                        >
                          <SelectTrigger id="quality">
                            <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="best">Best</SelectItem>
                            <SelectItem value="1080p">1080p</SelectItem>
                            <SelectItem value="720p">720p</SelectItem>
                            <SelectItem value="480p">480p</SelectItem>
                            <SelectItem value="360p">360p</SelectItem>
                            <SelectItem value="worst">Worst</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col space-y-1">
                          <Label htmlFor="useProxy">Use Proxy</Label>
                          <span className="text-sm text-muted-foreground">
                            Route stream through system proxy
                          </span>
                        </div>
                        <Switch
                          id="useProxy"
                          name="useProxy"
                          checked={formData.streamlinkOptions.useProxy}
                          onCheckedChange={(checked) => 
                            handleStreamlinkSwitchChange("useProxy", checked)
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col space-y-1">
                          <Label htmlFor="secureTokenEnabled">Secure Token</Label>
                          <span className="text-sm text-muted-foreground">
                            Enable token security
                          </span>
                        </div>
                        <Switch
                          id="secureTokenEnabled"
                          name="secureTokenEnabled"
                          checked={formData.streamlinkOptions.secureTokenEnabled}
                          onCheckedChange={(checked) => 
                            handleStreamlinkSwitchChange("secureTokenEnabled", checked)
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col space-y-1">
                          <Label htmlFor="useUserAgent">Custom User-Agent</Label>
                          <span className="text-sm text-muted-foreground">
                            Use custom user-agent string
                          </span>
                        </div>
                        <Switch
                          id="useUserAgent"
                          name="useUserAgent"
                          checked={formData.streamlinkOptions.useUserAgent}
                          onCheckedChange={(checked) => 
                            handleStreamlinkSwitchChange("useUserAgent", checked)
                          }
                        />
                      </div>
                      
                      {formData.streamlinkOptions.useUserAgent && (
                        <div className="grid gap-2">
                          <Label htmlFor="userAgent">User-Agent String</Label>
                          <Input
                            id="userAgent"
                            name="userAgent"
                            value={formData.streamlinkOptions.userAgent}
                            onChange={handleStreamlinkOptionsChange}
                            placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
                          />
                        </div>
                      )}
                      
                      <div className="grid gap-2">
                        <Label htmlFor="customArgs">
                          Custom Streamlink Arguments
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-4 h-4 ml-1 inline text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Additional arguments passed to Streamlink</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Textarea
                          id="customArgs"
                          name="customArgs"
                          value={formData.streamlinkOptions.customArgs}
                          onChange={handleStreamlinkOptionsChange}
                          placeholder="--stream-timeout 60 --http-timeout 60"
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Stream"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminStreamForm;
