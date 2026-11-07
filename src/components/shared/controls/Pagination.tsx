import Image from "next/image";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  return (
    <nav
      className="mt-10 flex w-full items-center justify-start gap-2"
      aria-label="Pagination katalog konsol"
    >
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="grid h-8 min-h-8 w-[2.35rem] place-items-center rounded-[2px] border border-black bg-[#ef542b] text-sm font-bold disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Halaman sebelumnya"
      >
        <Image
          src="/assets/Icons/next.svg"
          alt=""
          width={22}
          height={22}
          aria-hidden="true"
          className="rotate-180"
        />
      </button>
      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          aria-current={pageNumber === page ? "page" : undefined}
          onClick={() => onPageChange(pageNumber)}
          className={`grid h-8 w-8 place-items-center rounded-xs border border-black font-['Tiny5',monospace] text-lg ${pageNumber === page ? "bg-[#ed0011] text-white" : "bg-white hover:bg-[#cce5ff]"}`}
        >
          {pageNumber}
        </button>
      ))}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="grid h-8 min-h-8 w-[2.35rem] place-items-center rounded-[2px] border border-black bg-[#ef542b] text-sm font-bold disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Halaman berikutnya"
      >
        <Image
          src="/assets/Icons/next.svg"
          alt=""
          width={22}
          height={22}
          aria-hidden="true"
        />
      </button>
    </nav>
  );
}
