
import React from "react";
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  FileText, 
  Calendar, 
  Clock, 
  Folder, 
  FileCheck 
} from "lucide-react";

export const getTaskIcon = (iconName: string) => {
  switch (iconName) {
    case 'phone': return <Phone className="h-4 w-4" />;
    case 'message-circle': return <MessageCircle className="h-4 w-4" />;
    case 'file-text': return <FileText className="h-4 w-4" />;
    case 'calendar': return <Calendar className="h-4 w-4" />;
    case 'mail': return <Mail className="h-4 w-4" />;
    case 'folder': return <Folder className="h-4 w-4" />;
    case 'clock': return <Clock className="h-4 w-4" />;
    case 'file-check': return <FileCheck className="h-4 w-4" />;
    default: return <Calendar className="h-4 w-4" />;
  }
};

export const taskIconMap = {
  phone: Phone,
  'message-circle': MessageCircle,
  mail: Mail,
  'file-text': FileText,
  calendar: Calendar,
  clock: Clock,
  folder: FileText,
  'file-check': FileText
};
