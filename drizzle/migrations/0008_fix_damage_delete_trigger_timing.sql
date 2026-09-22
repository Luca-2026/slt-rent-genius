DROP TRIGGER IF EXISTS trg_inventory_damage_sync_delete ON public.b2b_inventory_damages;
CREATE TRIGGER trg_inventory_damage_sync_delete
AFTER DELETE ON public.b2b_inventory_damages
FOR EACH ROW EXECUTE FUNCTION public.sync_inventory_damage();