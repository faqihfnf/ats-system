"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  DollarSign,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useState } from "react";

type Candidate = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthPlace: string;
  birthDate: Date;
  gender: string;
  religion: string;
  ktpAddress: string;
  domicileAddress: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  education: { name: string };
  institution: string;
  startYear: number;
  endYear: string;
  lastJobTitle: string | null;
  lastCompany: string | null;
  jobStartYear: number | null;
  jobEndYear: string | null;
  currentSalary: number | null;
  expectedSalary: number;
  cvUrl: string | null;
  currentStage: { name: string } | null;
  status: string;
  createdAt: Date;
  job: {
    position: {
      nama: string;
      divisi: { nama: string };
      level: { nama: string };
    };
    customQuestions: any[];
  };
  answers: Array<{
    answer: string;
    question: {
      question: string;
      type: string;
    };
  }>;
};

type Props = {
  candidate: Candidate;
  jobId: string;
};

export function CandidateDetailView({ candidate, jobId }: Props) {
  const [showCV, setShowCV] = useState(true);

  const initials = candidate.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const age = calculateAge(candidate.birthDate);
  const isPDF = candidate.cvUrl?.toLowerCase().endsWith(".pdf");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/applicant/joblist/${jobId}/candidates`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Candidates
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {candidate.cvUrl && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCV(!showCV)}
              >
                <FileText className="mr-2 h-4 w-4" />
                {showCV ? "Hide CV" : "Show CV"}
              </Button>
              <Link href={candidate.cvUrl} target="_blank" download>
                <Button size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download CV
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Side - Candidate Info */}
        <div
          className={candidate.cvUrl && showCV ? "col-span-7" : "col-span-12"}
        >
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold">{candidate.fullName}</h1>
                    <p className="text-muted-foreground">
                      Applying for {candidate.job.position.nama}
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <Badge>
                        {candidate.currentStage?.name || "No Stage"}
                      </Badge>
                      <Badge variant="outline">{candidate.status}</Badge>
                      <span className="text-muted-foreground text-sm">
                        Applied{" "}
                        {format(new Date(candidate.createdAt), "PPP", {
                          locale: idLocale,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-muted-foreground text-sm">Email</p>
                    <p className="font-medium">{candidate.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-muted-foreground text-sm">Phone</p>
                    <p className="font-mono font-medium">{candidate.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-muted-foreground text-sm">Location</p>
                    <p className="font-medium">
                      {candidate.district}, {candidate.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-muted-foreground text-sm">Age</p>
                    <p className="font-medium">{age} years old</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Birth Place & Date
                    </p>
                    <p className="font-medium">
                      {candidate.birthPlace},{" "}
                      {format(new Date(candidate.birthDate), "PPP", {
                        locale: idLocale,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Gender</p>
                    <p className="font-medium">
                      {candidate.gender === "MALE" ? "Male" : "Female"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Religion</p>
                    <p className="font-medium">{candidate.religion}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">KTP Address</p>
                  <p className="font-medium">{candidate.ktpAddress}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Domicile Address
                  </p>
                  <p className="font-medium">{candidate.domicileAddress}</p>
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">{candidate.education.name}</p>
                  <p className="text-muted-foreground">
                    {candidate.institution}
                  </p>
                  <p className="text-sm">
                    {candidate.startYear} -{" "}
                    {candidate.endYear === "present"
                      ? "Present"
                      : candidate.endYear}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Work Experience */}
            {candidate.lastJobTitle && candidate.lastCompany && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">{candidate.lastJobTitle}</p>
                    <p className="text-muted-foreground">
                      {candidate.lastCompany}
                    </p>
                    <p className="text-sm">
                      {candidate.jobStartYear} -{" "}
                      {candidate.jobEndYear === "present"
                        ? "Present"
                        : candidate.jobEndYear}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Salary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5" />
                  Salary Expectations
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {candidate.currentSalary && (
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Current Salary
                    </p>
                    <p className="text-lg font-semibold">
                      Rp {candidate.currentSalary.toLocaleString("id-ID")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-sm">
                    Expected Salary
                  </p>
                  <p className="text-lg font-semibold">
                    Rp {candidate.expectedSalary.toLocaleString("id-ID")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Custom Questions & Answers */}
            {candidate.answers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Additional Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.answers.map((answer, idx) => (
                    <div key={idx}>
                      <p className="text-sm font-medium">
                        {answer.question.question}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {answer.answer}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Side - CV Viewer */}
        {candidate.cvUrl && showCV && (
          <div className="col-span-5">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Curriculum Vitae
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isPDF ? (
                  <iframe
                    src={candidate.cvUrl}
                    className="h-150 w-full rounded border"
                    title="CV Preview"
                  />
                ) : (
                  <div className="p-8 text-center">
                    <FileText className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                    <p className="text-muted-foreground text-sm">
                      Preview not available for this file type.
                    </p>
                    <Link href={candidate.cvUrl} target="_blank" download>
                      <Button size="sm" className="mt-4">
                        <Download className="mr-2 h-4 w-4" />
                        Download to View
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}
