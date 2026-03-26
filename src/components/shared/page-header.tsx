import type { LucideIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type BreadcrumbItemData = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  breadcrumbs?: BreadcrumbItemData[];
  action?: React.ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  breadcrumbs,
  action,
}: PageHeaderProps) {
  return (
    <div className="space-y-3">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <span key={item.label} className="flex items-center gap-1.5">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink
                      render={<a href={item.href} />}
                    >
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {Icon && (
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
