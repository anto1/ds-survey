"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addChannelSuggestion, type Channel } from "@/actions/channels";

type Props = {
  onChannelAdded: (channel: Channel) => void;
};

export function AddChannelDialog({ onChannelAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await addChannelSuggestion(formData);

      if (result.success && result.channel) {
        onChannelAdded(result.channel);
        setOpen(false);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(result.error || "Ошибка");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-none">
          Добавить канал
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-none border-border mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="font-normal">Предложить канал</DialogTitle>
          <DialogDescription>
            Канал появится в списке после модерации.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-normal">Название</Label>
              <Input
                id="name"
                name="name"
                placeholder="Например, Design Channel"
                required
                minLength={2}
                maxLength={80}
                disabled={isPending}
                className="rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl" className="text-sm font-normal">Ссылка на YouTube</Label>
              <Input
                id="youtubeUrl"
                name="youtubeUrl"
                type="url"
                placeholder="https://youtube.com/@channel"
                disabled={isPending}
                className="rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm font-normal">Комментарий</Label>
              <Textarea
                id="note"
                name="note"
                placeholder="Почему этот канал полезен?"
                rows={2}
                maxLength={500}
                disabled={isPending}
                className="rounded-none resize-none"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="rounded-none"
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isPending} className="rounded-none">
              {isPending ? "..." : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
