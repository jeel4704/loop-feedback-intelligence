export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

type RouteContext = { params: { id: string } };

// Single feedback record endpoint placeholder.
export async function GET(_: Request,  context: RouteContext) {
  if (process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  const params = context?.params || ({} as any);
  return NextResponse.json({ id: params.id, item: null });
}

export async function PATCH(_: Request,  context: RouteContext) {
  const params = context?.params || ({} as any);
  return NextResponse.json({ message: `Feedback ${params.id} updated.` });
}

export async function DELETE(_: Request,  context: RouteContext) {
  const params = context?.params || ({} as any);
  return NextResponse.json({ message: `Feedback ${params.id} deleted.` });
}

