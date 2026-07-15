export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

type RouteContext = { params: { id: string } };

// Theme detail endpoint placeholder.
export async function GET(_: Request, { params }: RouteContext) {
  return NextResponse.json({ id: params.id, item: null });
}

export async function PATCH(_: Request, { params }: RouteContext) {
  return NextResponse.json({ message: `Theme ${params.id} updated.` });
}

