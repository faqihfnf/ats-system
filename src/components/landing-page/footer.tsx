import Image from "next/image";
import {
  Facebook,
  Youtube,
  Instagram,
  Phone,
  MessageCircle,
  Clock,
} from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#1a3a8f" }} className="text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Kolom 1: Logo & Deskripsi */}
          <div className="flex flex-col gap-6">
            <div>
              <Image
                src="/logo.png"
                alt="Papandayan Cargo Logo"
                width={180}
                height={60}
                className="object-contain"
              />
            </div>
            <p className="text-sm leading-relaxed text-gray-200">
              Dari Jakarta, Surabaya, hingga Malang, Papandayan Cargo hadir
              memberikan solusi pengiriman yang andal dan efisien ke seluruh
              Indonesia. Dengan dukungan jaringan luas dan layanan yang
              berorientasi pada kenyamanan pelanggan, kami pastikan setiap
              pengiriman bernilai lebih.
            </p>
            <div className="mt-2 flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded border border-white/30 transition-colors hover:bg-white/20"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded border border-white/30 transition-colors hover:bg-white/20"
              >
                <Youtube size={16} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded border border-white/30 transition-colors hover:bg-white/20"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Kolom 2: Alamat */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold tracking-wide">ALAMAT</h3>
            <div className="flex flex-col gap-4 text-sm leading-relaxed text-gray-200">
              <p>
                <span className="font-bold text-white">Jakarta</span> : PK
                Djatmiko, Jl. Pahlawan Revolusi No.8, Klender, Kec. Duren Sawit,
                Kota Jakarta Timur, 13470
              </p>
              <p>
                <span className="font-bold text-white">Sidoarjo</span> : Komplek
                Pergudangan 88 A-11, Jl. Ps. Wisata, Dabean, Pabean, Kec.
                Sedati, Kabupaten Sidoarjo, Jawa Timur 61253
              </p>
              <p>
                <span className="font-bold text-white">Surabaya</span> : Jl.
                Perak Timur No.294, Perak Utara, Kec. Pabean Cantikan, Kota SBY,
                Jawa Timur 60165
              </p>
              <p>
                <span className="font-bold text-white">Malang</span> : Ruko
                Bandara Abd Saleh Kav 8, Jl Abdulrachman saleh, Upek Upek,
                Asrikaton, Pakis, Malang.
              </p>
            </div>
          </div>

          {/* Kolom 3: Kontak Kami */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold tracking-wide">KONTAK KAMI</h3>
            <div className="flex flex-col gap-3 text-sm text-gray-200">
              <p className="font-bold text-white">
                PT. Papandayan Nusantara Perkasa
              </p>
              <p className="leading-relaxed">
                Jl. Pahlawan Revolusi No.8, Klender, Kec. Duren Sawit, Kota
                Jakarta Timur, Daerah Khusus Ibukota Jakarta 13470
              </p>

              <div className="mt-2 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Phone size={16} className="shrink-0 text-white" />
                  <span>(021) 8605670</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle size={16} className="shrink-0 text-white" />
                  <span>+628-1110-2560</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="mt-0.5 shrink-0 text-white" />
                  <span>
                    Senin - Jumat : 08.30 - 17.00 WIB
                    <br />
                    Sabtu : 08.30 - 15.00 WIB
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20">
        <div className="mx-auto max-w-7xl px-6 py-4 text-center text-sm text-gray-300">
          © All rights reserved Papandayan Cargo 2026
        </div>
      </div>
    </footer>
  );
}
