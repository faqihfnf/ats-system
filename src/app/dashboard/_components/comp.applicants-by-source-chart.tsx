"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ApplicantsBySourceChart({ data }: { data: { name: string; count: number }[] }) {
  return <Card><CardHeader><CardTitle>Applicants by Source</CardTitle><p className="text-muted-foreground text-sm">Sumber kandidat pada periode terpilih</p></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={data} layout="vertical" margin={{ left: 20 }}><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="count" fill="hsl(193, 100%, 29%)" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>;
}
