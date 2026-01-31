type Props = {
  currentStep: 1 | 2;
};

export function ProgressIndicator({ currentStep }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <span
        className={currentStep === 1 ? "text-foreground font-medium" : ""}
      >
        Шаг 1
      </span>
      <span className="text-border">/</span>
      <span
        className={currentStep === 2 ? "text-foreground font-medium" : ""}
      >
        Шаг 2
      </span>
    </div>
  );
}
