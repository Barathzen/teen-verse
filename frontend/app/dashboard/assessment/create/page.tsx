import { AssessmentForm } from "@/components/assessment/AssessmentForm";

export const metadata = {
  title: "Create Assessment - TeenVerse",
};

export default function CreateAssessmentPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <AssessmentForm />
    </div>
  );
}
