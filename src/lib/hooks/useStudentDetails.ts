import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";
import { StudentDetails } from "@/app/types/types";

export const useStudentDetails = (studentId: string | null) => {
  const supabase = createClient();

  const [data, setData] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Student Profile
        const { data: student, error: studentError } = await supabase
          .from("student_profile")
          .select("*")
          .eq("id", studentId)
          .single();

        if (studentError) throw studentError;

        // 2. Fetch Enrollments with relational Intakes & Courses
        const { data: enrollments, error: enrollmentError } = await supabase
          .from("enrollment")
          .select(
            `
            id,
            paid_amount,
            slips,
            status,
            created_at,
            intakes (
              id,
              name,
              code,
              start_date,
              end_date,
              status
            ),
            courses (
              id,
              course_name,
              course_code,
              programme_id
            )
          `,
          )
          .eq("reg_student_id", studentId);

        if (enrollmentError) throw enrollmentError;

        // 3. Fetch Programmes separately to prevent Supabase JOIN aliasing errors
        const formattedEnrollments = await Promise.all(
          (enrollments || []).map(async (e: any) => {
            let programmeData = null;

            if (e.courses?.programme_id) {
              const { data: prog } = await supabase
                .from("programmes")
                .select("id, programme_title, programme_code")
                .eq("id", e.courses.programme_id)
                .single();

              programmeData = prog;
            }

            return {
              enrollment_id: e.id,
              status: e.status,
              paid_amount: e.paid_amount,
              slips: e.slips,
              intake: e.intakes,
              course: e.courses
                ? {
                    id: e.courses.id,
                    title: e.courses.course_name || e.courses.title,
                    code: e.courses.course_code || e.courses.code,
                  }
                : null,
              programme: programmeData,
            };
          }),
        );

        setData({
          student,
          enrollments: formattedEnrollments,
        });
      } catch (err: any) {
        setError(err.message || "Error fetching student details");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  return { data, loading, error };
};
