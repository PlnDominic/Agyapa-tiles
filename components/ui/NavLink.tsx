import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps } from "react";
import { HOME_ONLY } from "@/lib/config";

/**
 * Drop-in replacement for next/link. In HOME_ONLY preview mode, anything that would leave the
 * homepage renders as an inert element (same look, no navigation). "/" and in-page "/#anchors" stay live.
 */
export function NavLink({ href, className, children, ...rest }: ComponentProps<typeof Link>) {
  const h = typeof href === "string" ? href : "";
  const allowed = h === "/" || h.startsWith("/#") || h.startsWith("#");
  if (HOME_ONLY && !allowed) {
    return (
      <span role="link" aria-disabled="true" className={clsx(className, "cursor-default")} onClick={rest.onClick as never}>
        {children}
      </span>
    );
  }
  return <Link href={href} className={className} {...rest}>{children}</Link>;
}
