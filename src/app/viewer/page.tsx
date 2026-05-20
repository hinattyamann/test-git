import Header from "@/components/Header";
import PdfViewer from "@/components/PdfViewer";

type ViewerPageProps = {
  searchParams?: Promise<{ path?: string }> | { path?: string };
};

export default async function ViewerPage({ searchParams }: ViewerPageProps) {
  const params = await searchParams;
  const path = params?.path || "";

  return (
    <main className="app-shell min-h-screen bg-slate-50">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <PdfViewer path={path} />
      </section>
    </main>
  );
}
