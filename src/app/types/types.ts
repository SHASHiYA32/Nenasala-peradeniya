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

export interface UserProfile {
  id: string;
  created_at: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  phone: string | null;
  address: string | null;
  gender: string | null;
  status: string | null;
  user_id: string | null;
  temp_psw: string | null;
  emp_id: string | null;
}

export type NewClassInput = Omit<ClassItem, 'id'>;