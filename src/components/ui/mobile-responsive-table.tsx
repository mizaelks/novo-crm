
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MobileTableRowProps {
  children: ReactNode;
  className?: string;
}

export const MobileTableRow = ({ children, className }: MobileTableRowProps) => {
  return (
    <Card className={cn("mb-4 md:hidden", className)}>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
};

interface MobileTableFieldProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export const MobileTableField = ({ label, value, className }: MobileTableFieldProps) => {
  return (
    <div className={cn("flex justify-between items-center py-2", className)}>
      <span className="text-sm font-medium text-muted-foreground">{label}:</span>
      <span className="text-sm">{value}</span>
    </div>
  );
};

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveTable = ({ children, className }: ResponsiveTableProps) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="hidden md:block">
        {children}
      </div>
    </div>
  );
};
