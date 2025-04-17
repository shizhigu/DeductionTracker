import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to the dashboard - this is our default landing page
  redirect("/dashboard")
}