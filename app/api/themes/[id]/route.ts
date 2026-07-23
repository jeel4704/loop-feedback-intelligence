export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

type RouteContext = { params: { id: string } };

// Theme detail endpoint placeholder.
export async function GET(_: Request,  context: RouteContext) {
  if (process.env.NEXT_BUILD_PHASE === "true" || process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  const params = context?.params || ({} as any);
  return NextResponse.json({ id: params.id, item: null });
}

export async function PATCH(_: Request,  context: RouteContext) {
  const params = context?.params || ({} as any);
  return NextResponse.json({ message: `Theme ${params.id} updated.` });
}

