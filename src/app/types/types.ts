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

export interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export type NewClassInput = Omit<ClassItem, 'id'>;

export interface StudentDetails {
  student: any;
  enrollments: Array<{
    enrollment_id: string;
    status: boolean;
    paid_amount: string;
    slips: any;
    intake: any;
    course: any;
    programme: any;
  }>;
}

export interface Programme {
  id: string;
  programme_title?: string;
  programme_code?: string;
  awrding_body?: string;
  duration?: number;
}

export interface Course {
  id: string;
  course_code?: string;
  course_name?: string;
  course_amount?: string;
  cover_image?: string;
  course_desc?: string;
  programme_id?: string;
  programmes?: Programme | null;
}

export interface Intake {
  id: string;
  name: string;
  code: string;
  status: string | null;
  start_date: string;
}

export interface SuccessDetails {
  email: string;
  temp_psw: string;
  stu_register_id: string;
  program_title: string;
  course_name: string;
}