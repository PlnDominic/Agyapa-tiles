-- Replace the original sample catalogue with the real inventory (supabase/seed.sql).
-- Only touches the old sample rows (SKU AGY-...) and the old sample categories; real products are never deleted.
delete from public.products where sku like 'AGY-%';
delete from public.categories
 where slug in ('marble-look', 'wood-look', 'terrazzo', 'geometric', 'wall-and-mosaic', 'outdoor')
   and not exists (select 1 from public.products p where p.category_id = categories.id);
