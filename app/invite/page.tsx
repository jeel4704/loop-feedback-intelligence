import InvitationClient from "./invitation-client";

export default function InvitePage({ searchParams }: { searchParams: { token: string } }) {
  // Using a static route with searchParams entirely eliminates Vercel edge routing bugs for dynamic segments
  return <InvitationClient token={searchParams.token} />;
}
