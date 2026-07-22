import InvitationClient from "./invitation-client";

export default function InvitePage({ params }: { params: { token: string } }) {
  // Using params in a Server Component automatically forces the route to be dynamic in Next.js App Router,
  // preventing Vercel from incorrectly serving a static 404 for missing paths!
  return <InvitationClient token={params.token} />;
}
