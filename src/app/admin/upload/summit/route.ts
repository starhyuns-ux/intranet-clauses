import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

function safeFileName(original: string) {
  // 확실하게: 영문/숫자/._- 만 남기고 나머지는 _
  const base = original.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "_");
  // 너무 길면 잘라내기
  return base.length > 80 ? base.slice(-80) : base;
}

export async function POST(req: Request) {
  const form = await req.formData();

  const companyId = String(form.get("companyId") ?? "");
  const title = String(form.get("title") ?? "");
  const effectiveDate = String(form.get("effectiveDate") ?? "");
  const versionLabel = String(form.get("versionLabel") ?? "");
  const file = form.get("file");

  if (!companyId || !title || !file || !(file instanceof File)) {
    return NextResponse.json({ message: "필수값 누락(companyId/title/file)" }, { status: 400 });
  }

  // 회사 코드 가져와서 경로에 쓰기
  const { data: company, error: cErr } = await supabaseServer
    .from("companies")
    .select("id,code")
    .eq("id", companyId)
    .single();

  if (cErr || !company?.code) {
    return NextResponse.json({ message: cErr?.message ?? "회사 조회 실패" }, { status: 400 });
  }

  const ext = file.name.toLowerCase().endsWith(".pdf") ? ".pdf" : "";
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15); // YYYYMMDDTHHMMSS
  const filename = safeFileName(file.name.replace(/\.pdf$/i, "")) + ext;
  const filePath = `company/${company.code}/${stamp}_${filename}`;

  // Storage 업로드
  const { error: upErr } = await supabaseServer.storage
    .from("clause-docs")
    .upload(filePath, file, { contentType: "application/pdf", upsert: false });

  if (upErr) {
    return NextResponse.json({ message: "Storage 업로드 실패", detail: upErr.message }, { status: 500 });
  }

  // DB 등록 (clause_docs)
  const { error: insErr } = await supabaseServer.from("clause_docs").insert({
    company_id: companyId,
    title,
    effective_date: effectiveDate || null,
    version_label: versionLabel || null,
    file_path: filePath,
    source_note: "admin/upload",
  });

  if (insErr) {
    return NextResponse.json({ message: "DB 등록 실패", detail: insErr.message, file_path: filePath }, { status: 500 });
  }

  // 업로드 성공 → 문서 목록으로
  return NextResponse.redirect(new URL("/docs", req.url));
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
