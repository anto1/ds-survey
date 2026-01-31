"use client";

import { Button } from "@/components/ui/button";

const professions = [
  { id: "product", label: "Продуктовый дизайнер" },
  { id: "graphic", label: "Графический дизайнер" },
  { id: "type", label: "Шрифтовой дизайнер" },
  { id: "illustrator", label: "Иллюстратор" },
  { id: "motion", label: "Моушн-дизайнер" },
  { id: "3d", label: "3Д-дизайнер" },
  { id: "producer", label: "Продюсер" },
  { id: "art_director", label: "Арт-директор" },
  { id: "design_director", label: "Дизайн-директор" },
  { id: "creative_director", label: "Креативный директор" },
  { id: "marketer", label: "Маркетолог" },
  { id: "copywriter", label: "Копирайтер" },
  { id: "developer", label: "Разработчик" },
  { id: "student", label: "Студент" },
  { id: "recruiter", label: "Рекрутер" },
  { id: "other", label: "Другое" },
];

const workplaces = [
  { id: "inhouse", label: "Инхаус" },
  { id: "agency", label: "Агентство или студия" },
  { id: "freelance", label: "Фриланс" },
  { id: "other", label: "Другое" },
];

type Props = {
  profession: string | null;
  workplace: string | null;
  onProfessionChange: (value: string) => void;
  onWorkplaceChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export function StepAbout({
  profession,
  workplace,
  onProfessionChange,
  onWorkplaceChange,
  onBack,
  onSubmit,
  isSubmitting,
}: Props) {
  const canSubmit = profession && workplace;

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Шаг 3 из 3
        </p>
        <h1 className="text-2xl sm:text-3xl font-normal leading-tight">
          Немного о вас
        </h1>
        <p className="text-muted-foreground">
          Это поможет лучше понять аудиторию опроса.
        </p>
      </header>

      <div className="space-y-10">
        {/* Profession */}
        <div className="space-y-4">
          <h2 className="text-sm text-muted-foreground">Кто вы по профессии?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {professions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onProfessionChange(item.id)}
                className={`px-4 py-3 text-left text-sm border transition-colors ${
                  profession === item.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Workplace */}
        <div className="space-y-4">
          <h2 className="text-sm text-muted-foreground">Где вы работаете?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workplaces.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onWorkplaceChange(item.id)}
                className={`px-4 py-3 text-left text-sm border transition-colors ${
                  workplace === item.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 border-t border-border">
        <div />

        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            ← Назад
          </button>
          <Button
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            className="rounded-none"
          >
            {isSubmitting ? "Отправка..." : "Отправить"}
          </Button>
        </div>
      </footer>

      {!canSubmit && (
        <p className="text-center text-sm text-muted-foreground">
          Выберите профессию и место работы.
        </p>
      )}
    </div>
  );
}
