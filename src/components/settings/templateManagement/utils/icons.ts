
import { FileText, Hash, Calendar, CheckSquare, List } from "lucide-react";

export const getFieldIcon = (type: string) => {
  switch (type) {
    case "text": return <FileText className="h-4 w-4" />;
    case "number": return <Hash className="h-4 w-4" />;
    case "date": return <Calendar className="h-4 w-4" />;
    case "checkbox": return <CheckSquare className="h-4 w-4" />;
    case "select": return <List className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};
