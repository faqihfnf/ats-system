import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Answer = {
  answer: string;
  question: {
    question: string;
    type: string;
  };
};

type Props = {
  answers: Answer[];
};

export function AdditionalQuestions({ answers }: Props) {
  if (answers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Additional Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {answers.map((answer, idx) => (
          <div key={idx} className="space-y-1">
            <p className="text-xs font-medium">{answer.question.question}</p>
            <p className="text-muted-foreground text-sm">{answer.answer}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
