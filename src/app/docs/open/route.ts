import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const docId = url.searchParams.get("docId") ?? "";

  if (!docId) {
    return NextResponse.json({ message: "docId가 없습니다." }, { status: 400 });
  }

  const { data: doc, error } = await supabaseServer
    .from("clause_docs")
    .select("file_path")
    .eq("id", docId)
    .single();

  if (error || !doc?.file_path) {
    return NextResponse.json({ message: error?.message ?? "문서 없음" }, { status: 400 });
  }

  const { data: signed, error: sErr } = await supabaseServer
    .storage
    .from("clause-docs")
    .createSignedUrl(doc.file_path, 60 * 10);

  if (sErr || !signed?.signedUrl) {
    return NextResponse.json(
      { message: sErr?.message ?? "Signed URL 실패", file_path: doc.file_path, docId },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}

/** Next가 HEAD 요청을 보낼 때 405 나는 경우가 있어서 GET으로 처리 */
export async function HEAD(req: Request) {
  return GET(req);
}
