export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <p className="text-lg font-bold text-foreground">Perusahaan</p>
            <p className="mt-1 text-sm text-muted-foreground">Membangun masa depan yang lebih baik, bersama.</p>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Tentang Kami
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Produk
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Blog
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Kontak
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>{"2026 Perusahaan. Semua hak dilindungi undang-undang."}</p>
        </div>
      </div>
    </footer>
  );
}
