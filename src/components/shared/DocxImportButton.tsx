'use client';

import { useRef } from 'react';
import { FileDown } from 'lucide-react';
import { GlassButton } from '@/components/shared/GlassButton';
import { importDocx } from '@/lib/docx-utils';

interface DocxImportButtonProps {
  onImport: (html: string) => void;
}

export function DocxImportButton({ onImport }: DocxImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const html = await importDocx(file);
      onImport(html);
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".docx"
        className="hidden"
        onChange={handleChange}
      />
      <GlassButton
        size="sm"
        icon={<FileDown size={14} />}
        onClick={() => inputRef.current?.click()}
        title="Import DOCX"
        className="hidden md:flex"
      />
    </>
  );
}
