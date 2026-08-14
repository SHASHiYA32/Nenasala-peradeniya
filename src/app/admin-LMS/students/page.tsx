"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Mail,
  Phone,
  Clock,
  XCircle,
  Eye,
  X,
  Award,
  Calendar,
  CheckCircle2,
} from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Types
interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issuedDate: string;
}

interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  academicYear: "Year 1" | "Year 2" | "Year 3" | "Year 4";
  enrollmentStatus: "active" | "suspended" | "graduated" | "pending";
  joinedDate: string;
  certificates: Certificate[];
  pendingSubmissionsCount: number;
  avatarUrl?: string;
}

// Sample Data
const INITIAL_STUDENTS: Student[] = [
  {
    id: "STU-01",
    studentId: "STU-2026-041",
    name: "Sahan Jayasinghe",
    email: "sahan.j@gmail.com",
    phone: "+94 77 123 4567",
    program: "BSc in Software Engineering",
    academicYear: "Year 3",
    enrollmentStatus: "active",
    joinedDate: "2024-02-15",
    pendingSubmissionsCount: 2,
    certificates: [
      {
        id: "CERT-101",
        title: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services",
        issuedDate: "2025-06-10",
      },
      {
        id: "CERT-102",
        title: "Meta Front-End Developer Specialization",
        issuer: "Coursera / Meta",
        issuedDate: "2025-11-20",
      },
    ],
  },
  {
    id: "STU-02",
    studentId: "STU-2026-042",
    name: "Kavindi Perera",
    email: "kavindi.p@outlook.com",
    phone: "+94 71 987 6543",
    program: "Diploma in Information Technology",
    academicYear: "Year 1",
    enrollmentStatus: "active",
    joinedDate: "2026-01-10",
    pendingSubmissionsCount: 1,
    certificates: [
      {
        id: "CERT-103",
        title: "Responsive Web Design Fundamentals",
        issuer: "freeCodeCamp",
        issuedDate: "2026-03-01",
      },
    ],
  },
  {
    id: "STU-03",
    studentId: "STU-2026-043",
    name: "Tariq Ahamad",
    email: "tariq.a@yahoo.com",
    phone: "+94 75 456 7890",
    program: "MSc in Cyber Security",
    academicYear: "Year 2",
    enrollmentStatus: "active",
    joinedDate: "2025-09-01",
    pendingSubmissionsCount: 0,
    certificates: [
      {
        id: "CERT-104",
        title: "CompTIA Security+",
        issuer: "CompTIA",
        issuedDate: "2025-10-15",
      },
      {
        id: "CERT-105",
        title: "Ethical Hacking Essentials (EHE)",
        issuer: "EC-Council",
        issuedDate: "2026-02-04",
      },
      {
        id: "CERT-106",
        title: "Google Cybersecurity Professional",
        issuer: "Coursera / Google",
        issuedDate: "2026-05-18",
      },
    ],
  },
  {
    id: "STU-04",
    studentId: "STU-2025-019",
    name: "Dilshan Rathnayake",
    email: "dilshan.r@gmail.com",
    phone: "+94 70 333 2211",
    program: "BSc in Software Engineering",
    academicYear: "Year 4",
    enrollmentStatus: "graduated",
    joinedDate: "2022-02-10",
    pendingSubmissionsCount: 0,
    certificates: [
      {
        id: "CERT-107",
        title: "Full-Stack Web Development Bootcamp",
        issuer: "Udemy",
        issuedDate: "2023-08-12",
      },
      {
        id: "CERT-108",
        title: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        issuedDate: "2024-12-01",
      },
    ],
  },
  {
    id: "STU-05",
    studentId: "STU-2026-088",
    name: "Nipuni Silva",
    email: "nipuni.silva@gmail.com",
    phone: "+94 77 888 9900",
    program: "Diploma in Information Technology",
    academicYear: "Year 1",
    enrollmentStatus: "pending",
    joinedDate: "2026-08-01",
    pendingSubmissionsCount: 3,
    certificates: [],
  },
  {
    id: "STU-06",
    studentId: "STU-2024-112",
    name: "Nuwan Fernando",
    email: "nuwan.f@domain.com",
    phone: "+94 72 111 4455",
    program: "MSc in Cyber Security",
    academicYear: "Year 2",
    enrollmentStatus: "suspended",
    joinedDate: "2024-05-20",
    pendingSubmissionsCount: 0,
    certificates: [],
  },
];

const PROGRAM_OPTIONS = [
  "All Programs",
  "BSc in Software Engineering",
  "Diploma in Information Technology",
  "MSc in Cyber Security",
];

const YEAR_OPTIONS = ["All Years", "Year 1", "Year 2", "Year 3", "Year 4"];

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending Approval", value: "pending" },
  { label: "Suspended", value: "suspended" },
  { label: "Graduated", value: "graduated" },
];

const CERTIFICATE_FILTER_OPTIONS = [
  { label: "All Certificates Filter", value: "all" },
  { label: "Has Certificates", value: "has_certs" },
  { label: "No Certificates", value: "no_certs" },
  { label: "Multiple Certs (2+)", value: "multiple_certs" },
];

export default function StudentDirectoryPage() {
  const [students] = useState<Student[]>(INITIAL_STUDENTS);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("All Programs");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCertFilter, setSelectedCertFilter] = useState("all");

  // Selected Student for Modal View
  const [viewStudent, setViewStudent] = useState<Student | null>(null);

  // Filter Logic
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.phone.includes(searchQuery) ||
        student.certificates.some((cert) =>
          cert.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesProgram =
        selectedProgram === "All Programs" ||
        student.program === selectedProgram;

      const matchesYear =
        selectedYear === "All Years" || student.academicYear === selectedYear;

      const matchesStatus =
        selectedStatus === "all" || student.enrollmentStatus === selectedStatus;

      let matchesCert = true;
      if (selectedCertFilter === "has_certs") {
        matchesCert = student.certificates.length > 0;
      } else if (selectedCertFilter === "no_certs") {
        matchesCert = student.certificates.length === 0;
      } else if (selectedCertFilter === "multiple_certs") {
        matchesCert = student.certificates.length >= 2;
      }

      return (
        matchesSearch &&
        matchesProgram &&
        matchesYear &&
        matchesStatus &&
        matchesCert
      );
    });
  }, [
    students,
    searchQuery,
    selectedProgram,
    selectedYear,
    selectedStatus,
    selectedCertFilter,
  ]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedProgram("All Programs");
    setSelectedYear("All Years");
    setSelectedStatus("all");
    setSelectedCertFilter("all");
  };

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedProgram !== "All Programs" ? 1 : 0) +
    (selectedYear !== "All Years" ? 1 : 0) +
    (selectedStatus !== "all" ? 1 : 0) +
    (selectedCertFilter !== "all" ? 1 : 0);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("");

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Users className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Student Directory
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Browse, filter, and manage all enrolled students across programs,
              academic years, and earned certifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="px-3 py-1.5 text-xs font-semibold"
            >
              Total Enrolled:{" "}
              <strong className="ml-1 text-foreground">
                {students.length}
              </strong>
            </Badge>
          </div>
        </div>

        {/* Filter Control Bar */}
        <Card>
          <CardHeader className="p-4 space-y-0">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by student name, ID, email, or certificate title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 text-xs h-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              {/* Dropdown Filters Group */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Program Selector */}
                <Select
                  value={selectedProgram}
                  onValueChange={(val) =>
                    setSelectedProgram(val ?? "All Programs")
                  }
                >
                  <SelectTrigger className="w-[180px] h-9 text-xs">
                    <SelectValue placeholder="Select Program" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_OPTIONS.map((prog) => (
                      <SelectItem key={prog} value={prog} className="text-xs">
                        {prog}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year Selector */}
                <Select
                  value={selectedYear}
                  onValueChange={(val) => setSelectedYear(val ?? "All Years")}
                >
                  <SelectTrigger className="w-[120px] h-9 text-xs">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((year) => (
                      <SelectItem key={year} value={year} className="text-xs">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Selector */}
                <Select
                  value={selectedStatus}
                  onValueChange={(val) => setSelectedStatus(val ?? "all")}
                >
                  <SelectTrigger className="w-[130px] h-9 text-xs">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((st) => (
                      <SelectItem
                        key={st.value}
                        value={st.value}
                        className="text-xs"
                      >
                        {st.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Certificate Filter Selector */}
                <Select
                  value={selectedCertFilter}
                  onValueChange={(val) => setSelectedCertFilter(val ?? "all")}
                >
                  <SelectTrigger className="w-[160px] h-9 text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <SelectValue placeholder="Certificates" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {CERTIFICATE_FILTER_OPTIONS.map((certOpt) => (
                      <SelectItem
                        key={certOpt.value}
                        value={certOpt.value}
                        className="text-xs"
                      >
                        {certOpt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Reset Button */}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-9 px-3 text-xs gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear ({activeFiltersCount})</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Results Counter Summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing{" "}
            <strong className="text-foreground">
              {filteredStudents.length}
            </strong>{" "}
            of {students.length} students
          </span>
        </div>

        {/* Students Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-[11px] font-bold uppercase tracking-wider">
                <TableHead className="py-4 px-6">Student</TableHead>
                <TableHead className="py-4 px-6">Program & Year</TableHead>
                <TableHead className="py-4 px-6">Contact Info</TableHead>
                <TableHead className="py-4 px-6">Certificates</TableHead>
                <TableHead className="py-4 px-6">Status</TableHead>
                <TableHead className="py-4 px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground text-sm"
                  >
                    <div className="max-w-xs mx-auto space-y-2">
                      <Filter className="w-8 h-8 mx-auto opacity-50" />
                      <p className="font-semibold text-foreground">
                        No students matched your criteria
                      </p>
                      <p className="text-xs">
                        Try loosening your search query or clear active filters.
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={handleResetFilters}
                        className="text-xs font-medium"
                      >
                        Clear all filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="transition-colors">
                    {/* Student Info */}
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <AvatarFallback className="font-bold text-xs bg-transparent">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-foreground">
                            {student.name}
                          </div>
                          <span className="inline-block text-[11px] font-mono text-muted-foreground">
                            {student.studentId}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Program & Year */}
                    <TableCell className="py-4 px-6">
                      <div className="font-semibold text-foreground text-xs">
                        {student.program}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <Badge
                          variant="outline"
                          className="font-medium text-[10px]"
                        >
                          {student.academicYear}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Contact Info */}
                    <TableCell className="py-4 px-6 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{student.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{student.phone}</span>
                      </div>
                    </TableCell>

                    {/* Certificates Count Column */}
                    <TableCell className="py-4 px-6 text-xs">
                      {student.certificates.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="secondary"
                              className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-bold gap-1 px-2 py-0.5 text-[11px]"
                            >
                              <Award className="w-3.5 h-3.5" />
                              {student.certificates.length}{" "}
                              {student.certificates.length === 1
                                ? "Certificate"
                                : "Certificates"}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-[180px]">
                            {student.certificates[0].title}
                            {student.certificates.length > 1 && "..."}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          None earned
                        </span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4 px-6">
                      {student.enrollmentStatus === "active" && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </Badge>
                      )}
                      {student.enrollmentStatus === "pending" && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </Badge>
                      )}
                      {student.enrollmentStatus === "suspended" && (
                        <Badge
                          variant="outline"
                          className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Suspended
                        </Badge>
                      )}
                      {student.enrollmentStatus === "graduated" && (
                        <Badge
                          variant="outline"
                          className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 gap-1.5"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          Graduated
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 px-6 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewStudent(student)}
                        className="h-8 gap-1 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Profile</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* STUDENT PROFILE POPUP MODAL */}
      <Dialog
        open={!!viewStudent}
        onOpenChange={(open) => !open && setViewStudent(null)}
      >
        {viewStudent && (
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <AvatarFallback className="font-bold text-sm bg-transparent">
                    {getInitials(viewStudent.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-base font-bold">
                    {viewStudent.name}
                  </DialogTitle>
                  <span className="text-xs font-mono text-muted-foreground">
                    {viewStudent.studentId}
                  </span>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              {/* Academic Overview Card */}
              <div className="grid grid-cols-2 gap-3 bg-muted/50 p-4 rounded-xl border">
                <div>
                  <span className="text-muted-foreground block mb-0.5">
                    Academic Program
                  </span>
                  <span className="font-semibold text-foreground">
                    {viewStudent.program}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">
                    Current Level
                  </span>
                  <span className="font-semibold text-foreground">
                    {viewStudent.academicYear}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">
                    Certificates Count
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-sm flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {viewStudent.certificates.length} Total
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">
                    Enrollment Date
                  </span>
                  <span className="font-semibold text-foreground">
                    {viewStudent.joinedDate}
                  </span>
                </div>
              </div>

              {/* Certificates Detailed List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    Earned Certificates ({viewStudent.certificates.length})
                  </span>
                </div>

                {viewStudent.certificates.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {viewStudent.certificates.map((cert) => (
                      <Card
                        key={cert.id}
                        className="p-3 bg-card hover:bg-muted/30 transition-colors border-l-4 border-l-amber-500 space-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-foreground flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            {cert.title}
                          </h4>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-mono shrink-0 px-1.5 py-0"
                          >
                            {cert.id}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 pl-5">
                          <span>Issued by: <strong className="text-foreground">{cert.issuer}</strong></span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {cert.issuedDate}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-4 text-center text-muted-foreground bg-muted/20 border-dashed">
                    <p className="text-xs">No earned certificates recorded for this student.</p>
                  </Card>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-2 pt-1">
                <span className="font-semibold text-foreground block">
                  Contact Information
                </span>
                <Card className="p-3 space-y-2">
                  <div className="flex items-center gap-2 text-foreground">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span>{viewStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span>{viewStudent.phone}</span>
                  </div>
                </Card>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setViewStudent(null)}
                className="text-xs"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}