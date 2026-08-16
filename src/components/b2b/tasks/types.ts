export type TodoStatus = "draft" | "sent" | "in_progress" | "done";

export interface TodoList {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  assigned_to: string | null;
  assigned_name: string | null;
  assigned_email: string | null;
  created_by: string | null;
  created_by_name: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  sent_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TodoItem {
  id: string;
  list_id: string;
  title: string;
  note: string | null;
  is_done: boolean;
  done_at: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  sort_order: number;
}

export interface TodoComment {
  id: string;
  list_id: string;
  author_id: string | null;
  author_name: string | null;
  body: string;
  created_at: string;
}

export interface MaterialTransfer {
  id: string;
  item_name: string;
  quantity: number;
  from_location: string;
  to_location: string;
  tour_date: string | null;
  status: string;
  notes: string | null;
  todo_list_id: string | null;
  created_by: string | null;
  created_by_name: string | null;
  assigned_to?: string | null;
  assigned_name?: string | null;
  assigned_at?: string | null;
  done_at?: string | null;
  created_at: string;
}

export const LOCATIONS = [
  { value: "krefeld", label: "Krefeld" },
  { value: "bonn", label: "Bonn" },
  { value: "muelheim", label: "Mülheim an der Ruhr" },
] as const;

export const locationLabel = (value?: string | null) =>
  LOCATIONS.find((l) => l.value === value)?.label ?? value ?? "–";

export const STATUS_LABELS: Record<string, string> = {
  draft: "Entwurf",
  sent: "Abgeschickt",
  in_progress: "In Arbeit",
  done: "Erledigt",
};

export const TRANSFER_STATUS_LABELS: Record<string, string> = {
  offen: "Offen",
  eingeplant: "Tour geplant",
  unterwegs: "Unterwegs",
  erledigt: "Angekommen",
};

export function formatMinutes(min?: number | null): string {
  if (min === null || min === undefined) return "–";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}
