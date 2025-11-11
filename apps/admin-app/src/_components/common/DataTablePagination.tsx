'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@acme/ui/pagination';

type DataTablePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function generatePageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];

  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage <= 3) {
      // Near the start: 1, 2, 3, 4, ..., last
      for (let i = 2; i <= 4; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end: 1, ..., last-3, last-2, last-1, last
      pages.push('ellipsis');
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // In the middle: 1, ..., current-1, current, current+1, ..., last
      pages.push('ellipsis');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('ellipsis');
      pages.push(totalPages);
    }
  }

  return pages;
}

/**
 * Reusable pagination component for data tables
 */
export function DataTablePagination({ currentPage, totalPages, onPageChange, className }: DataTablePaginationProps) {
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  return (
    <div className={className || 'mt-4'}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) {
                  onPageChange(currentPage - 1);
                }
              }}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) {
                  onPageChange(currentPage + 1);
                }
              }}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
