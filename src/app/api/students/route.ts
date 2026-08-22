import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.",
      );
    }

    // Initialize Admin Supabase Client with Service Role Key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await req.json();
    const { formData, slipUrls, program_title, course_name } = body;

    // 1. Generate temp password
    const temp_psw = "NPU#" + Math.random().toString(36).slice(-8);

    // 2. Generate stu_register_id (e.g. NPU-STU-202600001)
    const year = new Date().getFullYear();
    const { count } = await supabaseAdmin
      .from("student_profile")
      .select("*", { count: "exact", head: true });

    const nextSeq = String((count || 0) + 1).padStart(5, "0");
    const stu_register_id = `NPU-STU-${year}${nextSeq}`;

    // 3. Create Supabase Auth User
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: temp_psw,
        email_confirm: true,
        user_metadata: {
          full_name: formData.full_name,
          stu_register_id,
        },
      });

    if (authError) throw authError;

    // 4. Create Student Profile linked to Auth User ID
    const { data: student, error: studentError } = await supabaseAdmin
      .from("student_profile")
      .insert([
        {
          id: authUser.user.id,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          address: formData.address,
          gardian_name: formData.gardian_name,
          gardian_phone: formData.gardian_phone,
          reg_amount: formData.reg_amount,
          status: formData.status,
          temp_psw: temp_psw,
          stu_register_id: stu_register_id,
        },
      ])
      .select()
      .single();

    if (studentError) throw studentError;

    // 5. Create Enrollment Record
    const { error: enrollmentError } = await supabaseAdmin
      .from("enrollment")
      .insert([
        {
          reg_student_id: student.id,
          course_id: formData.course_id || null,
          intake_id: formData.intake_id || null,
          paid_amount: formData.paid_amount,
          status: true,
          slips: slipUrls,
        },
      ]);

    if (enrollmentError) throw enrollmentError;

    return NextResponse.json({
      success: true,
      data: {
        email: formData.email,
        temp_psw,
        stu_register_id,
        program_title: program_title || "N/A",
        course_name: course_name || "N/A",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 },
    );
  }
}
