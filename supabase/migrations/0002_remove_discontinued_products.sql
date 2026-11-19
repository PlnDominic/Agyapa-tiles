-- Remove discontinued products. Past orders keep their line items (order_items.product_id is set null).
delete from public.products
where slug in ('cement-heritage', 'herringbone-ash', 'terrazzo-milano', 'zellige-brick-red');
