import { supabaseServer } from "@/lib/supabaseServer";

export default async function UploadPage() {
  const { data: companies } = await supabaseServer
    .from("companies")
    .select("id,name,code")
    .order("name");

  return (
    <main className="p-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">약관 업로드</h1>

      <form
  action="/admin/upload/submit"
  method="post"
  encType="multipart/form-data"
  className="space-y-4"
>

        <div>
          <label className="block text-sm mb-1">회사</label>
          <select name="companyId" className="border rounded p-2 w-full" required>
            <option value="">선택</option>
            {companies?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">문서 제목</label>
          <input name="title" className="border rounded p-2 w-full" placeholder="예: 흥국생명 약관" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">시행일</label>
            <input name="effectiveDate" type="date" className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm mb-1">버전</label>
            <input name="versionLabel" className="border rounded p-2 w-full" placeholder="v1" />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">PDF 파일</label>
          <input name="file" type="file" accept="application/pdf" required />
          <div className="text-xs text-gray-500 mt-1">※ 한글/특수문자 파일명은 자동으로 안전한 이름으로 저장됩니다.</div>
        </div>

        <button className="border rounded px-4 py-2" type="submit">
          업로드 + 등록
        </button>
      </form>
    </main>
  );
}
