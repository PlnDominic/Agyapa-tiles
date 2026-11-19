import { ButtonLink } from "@/components/ui/Button";
export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center text-center">
      <div><p className="eyebrow">404</p><h1 className="t-1 mt-3">This page took a wrong turn.</h1><div className="mt-8"><ButtonLink href="/">Back home</ButtonLink></div></div>
    </div>
  );
}
