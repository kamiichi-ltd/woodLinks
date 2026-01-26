-- Function to atomically increment view_count
create or replace function increment_view_count(card_slug text)
returns void as $$
begin
  update cards
  set view_count = view_count + 1
  where slug = card_slug;
end;
$$ language plpgsql security definer;
