"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = { barra: ReactNode; pie: ReactNode; extras: ReactNode; children: ReactNode };

export default function EstructuraSitio({ barra, pie, extras, children }: Props) {
  const enAdmin = usePathname().startsWith("/admin");

  return (
    <>
      {!enAdmin && barra}
      {children}
      {!enAdmin && pie}
      {!enAdmin && extras}
    </>
  );
}
