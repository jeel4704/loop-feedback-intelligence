export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

type RouteContext = { params: { id: string } };

// Single feedback record endpoint placeholder.
export async function GET(_: Request, { params }: RouteContext) {
  return NextResponse.json({ id: params.id, item: null });
}

export async function PATCH(_: Request, { params }: RouteContext) {
  return NextResponse.json({ message: `Feedback ${params.id} updated.` });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  return NextResponse.json({ message: `Feedback ${params.id} deleted.` });
}

