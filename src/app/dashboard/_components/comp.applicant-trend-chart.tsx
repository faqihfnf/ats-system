"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ApplicantTrendChart({ data }: { data: { date: string; count: number }[] }) {
  return <Card><CardHeader><CardTitle>Applicant Trend</CardTitle><p className="text-muted-foreground text-sm">Jumlah applicant yang masuk pada periode terpilih</p></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><AreaChart data={data}><XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} fontSize={11} tickLine={false} axisLine={false} /><Tooltip /><Area type="monotone" dataKey="count" stroke="hsl(193, 100%, 29%)" fill="hsl(193, 100%, 29%)" fillOpacity={0.15} /></AreaChart></ResponsiveContainer></CardContent></Card>;
}
