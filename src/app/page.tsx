import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function DocsPage() {
  const { data: docs, error } = await supabaseServer
    .from("clause_docs")
    .select("id,title,effective_date,version_label,file_path,uploaded_at")
    .order("uploaded_at", { ascending: false });

  if (error) return <div>문서 조회 에러: {error.message}</div>;

  return (
    <main className="p-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">약관 문서</h1>
        <Link href="/" className="text-sm underline">
          ← 회사 목록
        </Link>
      </div>

      <div className="space-y-3">
        {docs?.map((d) => (
          <div key={d.id} className="border rounded-lg p-4">
            <div className="font-semibold">{d.title}</div>
            <div className="text-sm text-gray-500">
              시행일: {d.effective_date ?? "-"} / 버전: {d.version_label ?? "-"}
            </div>

            <a
  className="underline text-sm mt-3 inline-block"
  href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/clause-docs/${d.file_path}`}
  target="_blank"
  rel="noreferrer"
>
  열기
</a>





            <div className="text-xs text-gray-400 mt-2">
              path: {d.file_path}
            </div>
          </div>
        ))}

        {(!docs || docs.length === 0) && (
          <div className="text-gray-500">등록된 문서가 없습니다.</div>
        )}
      </div>
    </main>
  );
}
