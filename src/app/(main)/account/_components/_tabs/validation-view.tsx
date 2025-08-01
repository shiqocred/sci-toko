import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface ValidationsProps {
  label: string;
  isValid: boolean;
}

interface ValidationViewProps {
  validations: ValidationsProps[];
  strengthText: string;
  progressPercentage: number;
  hasPassword: boolean;
  allValid: boolean;
}

export const ValidationView = ({
  validations,
  strengthText,
  progressPercentage,
  hasPassword,
  allValid,
}: ValidationViewProps) => {
  return (
    <div
      className={cn(
        "w-full p-3 animate-in slide-in-from-top-2 duration-300 rounded-md border bg-gray-50 border-gray-200 space-y-2",
        hasPassword && allValid && "bg-green-50 border-green-200",
        hasPassword && !allValid && "bg-red-50 border-red-200"
      )}
    >
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium">Password Strength:</span>
          <span className="text-xs font-medium">{strengthText}</span>
        </div>
        <Progress
          value={progressPercentage}
          className="h-1 transition-all duration-500"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium">Password Requirements:</p>
        <ul className="space-y-1">
          {validations.map(({ label, isValid }, i) => (
            <li
              key={`${label}-${i}`}
              className="flex items-center gap-2 text-xs"
            >
              {isValid ? (
                <Check className="size-3.5 text-green-500" />
              ) : (
                <X className="size-3.5 text-gray-400" />
              )}
              <span className={isValid ? "text-green-700" : "text-gray-600"}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
