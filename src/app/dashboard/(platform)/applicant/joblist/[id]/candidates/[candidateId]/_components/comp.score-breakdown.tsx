// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Progress } from "@/components/ui/progress";
// import {
//   Sparkles,
//   GraduationCap,
//   Briefcase,
//   Calendar,
//   DollarSign,
//   User,
//   Church,
//   AlertCircle,
//   Loader2,
//   ThumbsUp,
//   ThumbsDown,
//   FileText,
// } from "lucide-react";
// import { scoreCandidate } from "../../_actions/action.candidates";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { Separator } from "@/components/ui/separator";

// type Props = {
//   candidateId: string;
//   totalScore: number | null;
//   educationScore: number | null;
//   experienceScore: number | null;
//   ageScore: number | null;
//   salaryScore: number | null;
//   genderScore: number | null;
//   religionScore: number | null;
//   scoredAt: Date | null;
//   // AI Analysis props (NEW)
//   aiStrengths: string | null;
//   aiWeaknesses: string | null;
//   aiConclusion: string | null;
//   aiRecommendation: string | null;
//   aiMatchPercentage: number | null;
//   analyzedAt: Date | null;
// };

// const WEIGHTS = {
//   EDUCATION: 20,
//   EXPERIENCE: 25,
//   AGE: 15,
//   SALARY: 15,
//   GENDER: 10,
//   RELIGION: 15,
// };

// export function ScoreBreakdown({
//   candidateId,
//   totalScore,
//   educationScore,
//   experienceScore,
//   ageScore,
//   salaryScore,
//   genderScore,
//   religionScore,
//   scoredAt,
//   aiStrengths,
//   aiWeaknesses,
//   aiConclusion,
//   aiRecommendation,
//   aiMatchPercentage,
//   analyzedAt,
// }: Props) {
//   const router = useRouter();
//   const [isScoring, setIsScoring] = useState(false);

//   const hasScore = totalScore !== null && totalScore > 0;
//   const hasAnalysis = aiStrengths !== null && aiWeaknesses !== null;

//   async function handleScore() {
//     console.log("=== BUTTON CLICKED ===");
//     console.log("Candidate ID:", candidateId);

//     setIsScoring(true);

//     try {
//       console.log("Calling scoreCandidate action...");
//       const result = await scoreCandidate(candidateId);

//       console.log("=== ACTION RESULT ===");
//       console.log("Result:", result);

//       if (result?.error) {
//         console.error("Error from action:", result.error);
//         toast.error(result.error, { position: "top-right" });
//       } else {
//         console.log("Success! Refreshing page...");
//         toast.success("Candidate scored and analyzed successfully!", {
//           position: "top-right",
//         });
//         router.refresh();
//       }
//     } catch (error) {
//       console.error("=== BUTTON HANDLER ERROR ===");
//       console.error("Error:", error);
//       toast.error("An unexpected error occurred", { position: "top-right" });
//     } finally {
//       setIsScoring(false);
//     }
//   }

//   if (!hasScore) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-lg">
//             <Sparkles className="h-5 w-5" />
//             Score & Analyze
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="flex flex-col items-center justify-center py-12">
//           <Sparkles className="text-muted-foreground mb-4 h-16 w-16" />
//           <p className="text-muted-foreground mb-2 text-center">
//             This candidate has not been scored yet.
//           </p>
//           <p className="text-muted-foreground mb-6 text-center text-sm">
//             Click the button below to generate score and AI analysis.
//           </p>
//           <Button onClick={handleScore} disabled={isScoring} size="lg">
//             {isScoring ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Analyzing...
//               </>
//             ) : (
//               <>
//                 <Sparkles className="mr-2 h-4 w-4" />
//                 Score & Analyze with AI
//               </>
//             )}
//           </Button>
//         </CardContent>
//       </Card>
//     );
//   }

//   const category = getCategoryFromScore(totalScore);
//   const categoryColor = getCategoryColor(category);

//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between">
//         <CardTitle className="flex items-center gap-2 text-lg">
//           <Sparkles className="h-5 w-5" />
//           Score & Analyze
//         </CardTitle>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={handleScore}
//           disabled={isScoring}
//         >
//           {isScoring ? (
//             <>
//               <Loader2 className="mr-2 h-3 w-3 animate-spin" />
//               Re-analyzing...
//             </>
//           ) : (
//             "Re-analyze"
//           )}
//         </Button>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* Disclaimer */}
//         <Alert>
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             AI scoring and analysis can be inaccurate or misleading. Use as
//             reference only.
//           </AlertDescription>
//         </Alert>

//         <div className="grid grid-cols-2 gap-6">
//           {/* Left: Rule-based Score */}
//           <div className="space-y-6">
//             <h3 className="text-sm font-semibold">Rule-based Score</h3>

//             {/* Total Score Circle */}
//             <div className="flex flex-col items-center py-6">
//               <div className="relative h-32 w-32">
//                 <svg className="h-full w-full -rotate-90">
//                   <circle
//                     cx="64"
//                     cy="64"
//                     r="56"
//                     stroke="currentColor"
//                     strokeWidth="10"
//                     fill="none"
//                     className="text-muted"
//                   />
//                   <circle
//                     cx="64"
//                     cy="64"
//                     r="56"
//                     stroke="currentColor"
//                     strokeWidth="10"
//                     fill="none"
//                     strokeDasharray={`${(totalScore / 100) * 351.68} 351.68`}
//                     className={categoryColor}
//                     strokeLinecap="round"
//                   />
//                 </svg>
//                 <div className="absolute inset-0 flex flex-col items-center justify-center">
//                   <span className="text-3xl font-bold">{totalScore}%</span>
//                   <span className="text-muted-foreground mt-1 text-xs">
//                     Final score
//                   </span>
//                 </div>
//               </div>
//               <Badge className="mt-4" variant={getBadgeVariant(category)}>
//                 {category} Match
//               </Badge>
//               {scoredAt && (
//                 <p className="text-muted-foreground mt-2 text-xs">
//                   Scored on {new Date(scoredAt).toLocaleString("id-ID")}
//                 </p>
//               )}
//             </div>

//             {/* Score Breakdown */}
//             <div className="space-y-3">
//               <h4 className="text-xs font-semibold">Score Breakdown</h4>

//               <ScoreItem
//                 icon={GraduationCap}
//                 label="Education"
//                 score={educationScore || 0}
//                 max={WEIGHTS.EDUCATION}
//               />
//               <ScoreItem
//                 icon={Briefcase}
//                 label="Work Experience"
//                 score={experienceScore || 0}
//                 max={WEIGHTS.EXPERIENCE}
//               />
//               <ScoreItem
//                 icon={Calendar}
//                 label="Age"
//                 score={ageScore || 0}
//                 max={WEIGHTS.AGE}
//               />
//               <ScoreItem
//                 icon={DollarSign}
//                 label="Salary"
//                 score={salaryScore || 0}
//                 max={WEIGHTS.SALARY}
//               />
//               <ScoreItem
//                 icon={User}
//                 label="Gender"
//                 score={genderScore || 0}
//                 max={WEIGHTS.GENDER}
//               />
//               <ScoreItem
//                 icon={Church}
//                 label="Religion"
//                 score={religionScore || 0}
//                 max={WEIGHTS.RELIGION}
//               />
//             </div>
//           </div>

//           {/* Right: AI Analysis */}
//           <div className="space-y-6">
//             <h3 className="text-sm font-semibold">AI Analysis</h3>

//             {hasAnalysis ? (
//               <>
//                 {/* AI Match Percentage */}
//                 <div className="flex flex-col items-center py-6">
//                   <div className="relative h-32 w-32">
//                     <svg className="h-full w-full -rotate-90">
//                       <circle
//                         cx="64"
//                         cy="64"
//                         r="56"
//                         stroke="currentColor"
//                         strokeWidth="10"
//                         fill="none"
//                         className="text-muted"
//                       />
//                       <circle
//                         cx="64"
//                         cy="64"
//                         r="56"
//                         stroke="currentColor"
//                         strokeWidth="10"
//                         fill="none"
//                         strokeDasharray={`${((aiMatchPercentage || 0) / 100) * 351.68} 351.68`}
//                         className={getAIRecommendationColor(aiRecommendation)}
//                         strokeLinecap="round"
//                       />
//                     </svg>
//                     <div className="absolute inset-0 flex flex-col items-center justify-center">
//                       <span className="text-3xl font-bold">
//                         {aiMatchPercentage}%
//                       </span>
//                       <span className="text-muted-foreground mt-1 text-xs">
//                         AI Match
//                       </span>
//                     </div>
//                   </div>
//                   <Badge
//                     className="mt-4"
//                     variant={getAIRecommendationBadge(aiRecommendation)}
//                   >
//                     {getAIRecommendationLabel(aiRecommendation)}
//                   </Badge>
//                   {analyzedAt && (
//                     <p className="text-muted-foreground mt-2 text-xs">
//                       Analyzed on {new Date(analyzedAt).toLocaleString("id-ID")}
//                     </p>
//                   )}
//                 </div>

//                 {/* Strengths */}
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <ThumbsUp className="h-4 w-4 text-green-600" />
//                     <h4 className="text-xs font-semibold">Kelebihan</h4>
//                   </div>
//                   <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
//                     <p className="text-sm whitespace-pre-line text-green-900 dark:text-green-100">
//                       {aiStrengths}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Weaknesses */}
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <ThumbsDown className="h-4 w-4 text-red-600" />
//                     <h4 className="text-xs font-semibold">Kekurangan</h4>
//                   </div>
//                   <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
//                     <p className="text-sm whitespace-pre-line text-red-900 dark:text-red-100">
//                       {aiWeaknesses}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Conclusion */}
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <FileText className="h-4 w-4 text-blue-600" />
//                     <h4 className="text-xs font-semibold">Kesimpulan</h4>
//                   </div>
//                   <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
//                     <p className="text-sm text-blue-900 dark:text-blue-100">
//                       {aiConclusion}
//                     </p>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-12 text-center">
//                 <Sparkles className="text-muted-foreground mb-3 h-12 w-12" />
//                 <p className="text-muted-foreground text-sm">
//                   AI analysis not available yet.
//                   <br />
//                   Click "Re-analyze" to generate.
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // Score Item Component (existing)
// type ScoreItemProps = {
//   icon: React.ElementType;
//   label: string;
//   score: number;
//   max: number;
// };

// function ScoreItem({ icon: Icon, label, score, max }: ScoreItemProps) {
//   const percentage = Math.round((score / max) * 100);

//   return (
//     <div className="space-y-1">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <Icon className="text-muted-foreground h-3 w-3" />
//           <span className="text-xs">{label}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className="font-mono text-xs font-medium">
//             {score}/{max}
//           </span>
//           <span className="text-muted-foreground text-xs">{percentage}%</span>
//         </div>
//       </div>
//       <Progress value={percentage} className="h-1.5" />
//     </div>
//   );
// }

// // Helper functions (existing)
// function getCategoryFromScore(
//   score: number,
// ): "Excellent" | "Good" | "Fair" | "Poor" {
//   if (score >= 80) return "Excellent";
//   if (score >= 60) return "Good";
//   if (score >= 40) return "Fair";
//   return "Poor";
// }

// function getCategoryColor(category: string): string {
//   switch (category) {
//     case "Excellent":
//       return "text-green-500";
//     case "Good":
//       return "text-blue-500";
//     case "Fair":
//       return "text-yellow-500";
//     case "Poor":
//       return "text-red-500";
//     default:
//       return "text-gray-500";
//   }
// }

// function getBadgeVariant(
//   category: string,
// ): "default" | "secondary" | "destructive" | "outline" {
//   switch (category) {
//     case "Excellent":
//       return "default";
//     case "Good":
//       return "secondary";
//     case "Fair":
//       return "outline";
//     case "Poor":
//       return "destructive";
//     default:
//       return "outline";
//   }
// }

// // AI Recommendation helpers (NEW)
// function getAIRecommendationColor(recommendation: string | null): string {
//   switch (recommendation) {
//     case "RECOMMENDED":
//       return "text-green-500";
//     case "SUGGESTED":
//       return "text-yellow-500";
//     case "NOT_RECOMMENDED":
//       return "text-red-500";
//     default:
//       return "text-gray-500";
//   }
// }

// function getAIRecommendationBadge(
//   recommendation: string | null,
// ): "default" | "secondary" | "destructive" {
//   switch (recommendation) {
//     case "RECOMMENDED":
//       return "default";
//     case "SUGGESTED":
//       return "secondary";
//     case "NOT_RECOMMENDED":
//       return "destructive";
//     default:
//       return "secondary";
//   }
// }

// function getAIRecommendationLabel(recommendation: string | null): string {
//   switch (recommendation) {
//     case "RECOMMENDED":
//       return "Direkomendasikan";
//     case "SUGGESTED":
//       return "Disarankan";
//     case "NOT_RECOMMENDED":
//       return "Tidak Direkomendasikan";
//     default:
//       return "Tidak Ada Data";
//   }
// }
