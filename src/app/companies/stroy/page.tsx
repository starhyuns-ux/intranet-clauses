import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function CompanyPage({
  params,
}: {
  params: { id: string };
}) {
  const companyId = params.id;

  const { data: company, error: cErr } = await supabase
    .from("companies")
    .select("id,name,code")
    .eq("id", companyId)
    .single();

  if (cErr) return <div>회사 조회 에러: {cErr.message}</div>;

  const { data: riders, error: rErr } = await supabase
    .from("riders")
    .select("id,name,category,summary")
    .eq("company_id", companyId)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (rErr) return <div>특약 조회 에러: {rErr.message}</div>;

  return (
    <main className="p-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-sm text-gray-500">특약 목록</p>
        </div>
        <Link href="/" className="text-sm underline">
          ← 회사 목록
        </Link>
      </div>

      <div className="space-y-3">
        {riders?.map((r) => (
          <div key={r.id} className="border rounded-lg p-4">
            <div className="text-xs text-gray-500">{r.category ?? "기타"}</div>
            <div className="text-lg font-semibold">{r.name}</div>
            {r.summary ? (
              <div className="text-sm text-gray-600 mt-1">{r.summary}</div>
            ) : null}
          </div>
        ))}

        {(!riders || riders.length === 0) && (
          <div className="text-gray-500">등록된 특약이 없습니다.</div>
        )}
      </div>
    </main>
  );
}
