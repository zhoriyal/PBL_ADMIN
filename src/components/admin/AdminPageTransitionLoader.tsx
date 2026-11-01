"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function LoaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Trigger loading sejenak saat URL/path berubah
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#FAF8F5]/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex items-center justify-center">
        {/* Lingkaran Luar Berputar */}
        <div className="h-16 w-16 rounded-full border-4 border-[#E2DDD5] border-t-[#2C4A2C] animate-spin" />
        
        {/* Ikon Museum / Lambang Tengah */}
        <div className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-[#2C4A2C] text-[#C9A84C] shadow-md">
          <svg
            viewBox="0 0 64 64"
            className="h-5 w-5 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="6" y="52" width="52" height="5" rx="2" />
            <rect x="10" y="30" width="6" height="22" rx="1" />
            <rect x="22" y="30" width="6" height="22" rx="1" />
            <rect x="36" y="30" width="6" height="22" rx="1" />
            <rect x="48" y="30" width="6" height="22" rx="1" />
            <polygon points="4,30 32,10 60,30" />
          </svg>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2C4A2C]">
          Museum Brawijaya
        </p>
        <p className="text-[11px] text-[#727A71] mt-0.5 animate-pulse">
          Memuat halaman admin...
        </p>
      </div>
    </div>
  );
}

export default function AdminPageTransitionLoader() {
  return (
    <Suspense fallback={null}>
      <LoaderContent />
    </Suspense>
  );
}
