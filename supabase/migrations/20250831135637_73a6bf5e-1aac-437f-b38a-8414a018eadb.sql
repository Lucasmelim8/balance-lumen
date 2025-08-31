-- Insert default categories for new users
create or replace function public.create_default_categories_for_user()
returns trigger 
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert default categories for the new user
  insert into public.categories (user_id, name, color, type) values
    (new.id, 'Alimentação', '#ef4444', 'expense'),
    (new.id, 'Transporte', '#f97316', 'expense'),
    (new.id, 'Moradia', '#eab308', 'expense'),
    (new.id, 'Salário', '#22c55e', 'income'),
    (new.id, 'Freelance', '#10b981', 'income');
  
  return new;
end;
$$;

-- Create trigger to run when a new user is created
create trigger on_auth_user_created_create_categories
  after insert on auth.users
  for each row execute function public.create_default_categories_for_user();