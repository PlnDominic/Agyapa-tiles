import { ButtonLink } from "@/components/ui/Button";
export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center text-center">
      <div><p className="eyebrow">404</p><h1 className="t-1 mt-3">We couldn&rsquo;t find that tile.</h1><p className="lead mt-4">It may have been discontinued or moved.</p>
        <div className="mt-8"><ButtonLink href="/shop">Browse all tiles</ButtonLink></div></div>
    </div>
  );
}
