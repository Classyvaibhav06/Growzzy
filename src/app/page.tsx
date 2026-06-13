import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root to dashboard (or login if handled by middleware)
  redirect("/dashboard");
}
