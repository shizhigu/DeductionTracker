import * as React from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("bg-white flex flex-col h-full", className)}
        {...props}
      />
    );
  }
);
Sidebar.displayName = "Sidebar";

interface SidebarItemProps {
  icon?: React.ReactNode;
  title: string;
  href: string;
  isActive?: boolean;
}

const SidebarItem = ({
  icon,
  title,
  href,
  isActive = false,
}: SidebarItemProps) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-3 py-3 text-sm rounded-md",
          isActive
            ? "bg-primary-50 text-primary border-r-4 border-primary"
            : "text-neutral-600 hover:bg-neutral-50"
        )}
      >
        {icon && <span className="w-5 mr-3">{icon}</span>}
        <span>{title}</span>
      </a>
    </Link>
  );
};

export { Sidebar, SidebarItem };
