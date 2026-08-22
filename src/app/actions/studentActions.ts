import { createClient } from "@/lib/supabase/client";

export const updateStudentStatus = async (studentId: string, status: "active" | "inactive") => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("student_profile")
    .update({ status })
    .eq("id", studentId);

  if (error) throw error;
  return data;
};