type InfoItemProps = {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
};

export function InfoItem({ icon: Icon, label, value, mono }: InfoItemProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className={`text-sm wrap-break-word ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
