export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

type RouteContext = { params: { id: string } };

// Report detail endpoint placeholder.
export async function GET(_: Request, { params }: RouteContext) {
  return NextResponse.json({ id: params.id, item: null });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  return NextResponse.json({ message: `Report ${params.id} deleted.` });
}

