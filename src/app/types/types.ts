export interface ClassItem {
  id: string;
  title: string;
  code?: string;
  instructor?: string;
  room?: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  classType: 'online' | 'in-house';
  intake?: string | null;
  program?: string;
  course?: string;
}

export interface Task {
  id: string;
  title: string;
  type: "assignment" | "quiz";
  course: string;
  dueDate: string;
  submissions: number;
  totalAssigned: number;
  status: "live" | "draft" | "cancelled" | "completed" | "expired";
}

export type NewClassInput = Omit<ClassItem, 'id'>;