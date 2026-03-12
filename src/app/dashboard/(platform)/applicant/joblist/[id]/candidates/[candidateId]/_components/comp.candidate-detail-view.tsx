"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  User,
  Church,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useState } from "react";
import { ScoreBreakdown } from "./comp.score-breakdown";

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
  totalScore: number | null;
  educationScore: number | null;
  experienceScore: number | null;
  ageScore: number | null;
  salaryScore: number | null;
  genderScore: number | null;
  religionScore: number | null;
  scoredAt: Date | null;
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
  const yoe = calculateYearsOfExperience(
    candidate.jobStartYear,
    candidate.jobEndYear,
  );
  const isPDF = candidate.cvUrl?.toLowerCase().endsWith(".pdf");

  return (
    <div className="w-full space-y-6">
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

      {/* Top Section: CV Preview + Information */}
      <div className="grid grid-cols-4 gap-6">
        {/* CV Preview (3/4) */}
        {candidate.cvUrl && showCV && (
          <div className="col-span-3">
            <Card className="flex h-full flex-col">
              {" "}
              {/* ← Add flex flex-col */}
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Preview CV
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                {" "}
                {/* ← Add flex-1 flex flex-col */}
                {isPDF ? (
                  <iframe
                    src={candidate.cvUrl}
                    className="w-full flex-1 rounded border"
                    title="CV Preview"
                  />
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                    {" "}
                    {/* ← Add flex-1 */}
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
        {/* Information Sidebar (1/4) */}
        <div
          className={candidate.cvUrl && showCV ? "col-span-1" : "col-span-4"}
        >
          <div className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{candidate.fullName}</h2>
                    <p className="text-muted-foreground text-sm">
                      {candidate.job.position.nama}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Badge>{candidate.currentStage?.name || "No Stage"}</Badge>
                    <Badge variant="outline">{candidate.status}</Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Applied{" "}
                    {format(new Date(candidate.createdAt), "PPP", {
                      locale: idLocale,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem icon={Mail} label="Email" value={candidate.email} />
                <InfoItem
                  icon={Phone}
                  label="Phone"
                  value={candidate.phone}
                  mono
                />
                <InfoItem
                  icon={MapPin}
                  label="Location"
                  value={`${candidate.district}, ${candidate.city}`}
                />
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem
                  icon={Calendar}
                  label="Birth Place & Date"
                  value={`${candidate.birthPlace}, ${format(
                    new Date(candidate.birthDate),
                    "PPP",
                    { locale: idLocale },
                  )}`}
                />
                <InfoItem icon={User} label="Age" value={`${age} years old`} />
                <InfoItem
                  icon={User}
                  label="Gender"
                  value={candidate.gender === "MALE" ? "Male" : "Female"}
                />
                <InfoItem
                  icon={Church}
                  label="Religion"
                  value={candidate.religion}
                />
                <Separator />
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs font-medium">
                    KTP Address
                  </p>
                  <p className="text-sm">{candidate.ktpAddress}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs font-medium">
                    Domicile Address
                  </p>
                  <p className="text-sm">{candidate.domicileAddress}</p>
                </div>
              </CardContent>
            </Card>

            {/* Salary Expectations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4" />
                  Salary Expectations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.currentSalary && (
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Current Salary
                    </p>
                    <p className="text-sm font-semibold">
                      Rp {candidate.currentSalary.toLocaleString("id-ID")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs">
                    Expected Salary
                  </p>
                  <p className="text-sm font-semibold">
                    Rp {candidate.expectedSalary.toLocaleString("id-ID")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="h-4 w-4" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {candidate.lastJobTitle && candidate.lastCompany ? (
                  <>
                    <p className="text-sm font-semibold">
                      {candidate.lastJobTitle}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {candidate.lastCompany}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {candidate.jobStartYear} -{" "}
                      {candidate.jobEndYear === "present"
                        ? "Present"
                        : candidate.jobEndYear}
                    </p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {yoe}
                    </Badge>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Fresh Graduate / No Experience
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-4 w-4" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-semibold">
                  {candidate.education.name}
                </p>
                <p className="text-muted-foreground text-sm">
                  {candidate.institution}
                </p>
                <p className="text-muted-foreground text-xs">
                  {candidate.startYear} -{" "}
                  {candidate.endYear === "present"
                    ? "Present"
                    : candidate.endYear}
                </p>
              </CardContent>
            </Card>

            {/* Additional Questions */}
            {candidate.answers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Additional Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.answers.map((answer, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs font-medium">
                        {answer.question.question}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {answer.answer}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Score & Analyze */}
      <ScoreBreakdown
        candidateId={candidate.id}
        totalScore={candidate.totalScore}
        educationScore={candidate.educationScore}
        experienceScore={candidate.experienceScore}
        ageScore={candidate.ageScore}
        salaryScore={candidate.salaryScore}
        genderScore={candidate.genderScore}
        religionScore={candidate.religionScore}
        scoredAt={candidate.scoredAt}
      />
    </div>
  );
}

// Info Item Component
type InfoItemProps = {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
};

function InfoItem({ icon: Icon, label, value, mono }: InfoItemProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className={`break-break text-sm ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
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

function calculateYearsOfExperience(
  startYear: number | null,
  endYear: string | null,
): string {
  if (!startYear) return "Fresh Graduate";

  const currentYear = new Date().getFullYear();
  const end = endYear === "present" ? currentYear : parseInt(endYear || "0");

  if (!end || end < startYear) return "Fresh Graduate";

  const years = end - startYear;

  if (years === 0) return "< 1 year";
  if (years === 1) return "1 year";
  return `${years} years`;
}
