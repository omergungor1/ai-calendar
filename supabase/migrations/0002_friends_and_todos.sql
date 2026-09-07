alter table public.profiles
  add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and p.email is null;

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email))
  where email is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1)
    ),
    new.email
  );
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create table if not exists public.friend_invites (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references auth.users (id) on delete cascade,
  invitee_email text not null,
  invitee_id uuid references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friend_invites_no_self check (invitee_id is distinct from inviter_id)
);

create or replace function public.normalize_friend_invite()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.invitee_email = lower(trim(new.invitee_email));
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists friend_invites_normalize on public.friend_invites;
create trigger friend_invites_normalize
  before insert or update on public.friend_invites
  for each row execute function public.normalize_friend_invite();

create unique index if not exists friend_invites_pending_unique
  on public.friend_invites (inviter_id, invitee_email)
  where status = 'pending';

create index if not exists friend_invites_invitee_email_idx
  on public.friend_invites (invitee_email, status);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  status text not null default 'pending'
    check (status in ('pending', 'done', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

drop trigger if exists todos_set_updated_at on public.todos;
create trigger todos_set_updated_at
  before update on public.todos
  for each row execute function public.set_updated_at();

alter table public.friend_invites enable row level security;
alter table public.todos enable row level security;

drop policy if exists "friend_invites_select_related" on public.friend_invites;
create policy "friend_invites_select_related"
  on public.friend_invites
  for select
  to authenticated
  using (
    inviter_id = auth.uid()
    or invitee_id = auth.uid()
    or lower(invitee_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "friend_invites_insert_own" on public.friend_invites;
create policy "friend_invites_insert_own"
  on public.friend_invites
  for insert
  to authenticated
  with check (inviter_id = auth.uid());

drop policy if exists "friend_invites_update_related" on public.friend_invites;
create policy "friend_invites_update_related"
  on public.friend_invites
  for update
  to authenticated
  using (
    inviter_id = auth.uid()
    or invitee_id = auth.uid()
    or lower(invitee_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (
    inviter_id = auth.uid()
    or invitee_id = auth.uid()
    or lower(invitee_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "friend_invites_delete_inviter" on public.friend_invites;
create policy "friend_invites_delete_inviter"
  on public.friend_invites
  for delete
  to authenticated
  using (inviter_id = auth.uid() and status = 'pending');

drop policy if exists "todos_select_own" on public.todos;
create policy "todos_select_own"
  on public.todos
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "todos_insert_own" on public.todos;
create policy "todos_insert_own"
  on public.todos
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "todos_update_own" on public.todos;
create policy "todos_update_own"
  on public.todos
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "todos_delete_own" on public.todos;
create policy "todos_delete_own"
  on public.todos
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "events_select_own" on public.events;
drop policy if exists "events_select_own_or_friend" on public.events;
create policy "events_select_own_or_friend"
  on public.events
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.friend_invites f
      where f.status = 'accepted'
        and (
          (f.inviter_id = auth.uid() and f.invitee_id = events.user_id)
          or (f.invitee_id = auth.uid() and f.inviter_id = events.user_id)
        )
    )
  );

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_related" on public.profiles;
create policy "profiles_select_related"
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.friend_invites f
      where
        (
          f.status = 'accepted'
          and (
            (f.inviter_id = auth.uid() and f.invitee_id = profiles.id)
            or (f.invitee_id = auth.uid() and f.inviter_id = profiles.id)
          )
        )
        or (
          f.status = 'pending'
          and f.inviter_id = profiles.id
          and lower(f.invitee_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    )
  );

grant select, insert, update, delete on table public.friend_invites to authenticated;
grant select, insert, update, delete on table public.todos to authenticated;

revoke all on function public.normalize_friend_invite() from public, anon, authenticated;
