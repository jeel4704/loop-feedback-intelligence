export const dynamic = 'force-dynamic';

import InvitationClient from "./invitation-client";

export default function InvitePage({ searchParams }: { searchParams: { token: string } }) {
  // Using searchParams in a Server Component automatically forces the route to be dynamic in Next.js App Router,
  // preventing Vercel from incorrectly serving a static 404 for missing paths!
  return <InvitationClient token={searchParams.token} />;
}
