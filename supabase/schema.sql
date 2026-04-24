-- Rate limiting table
create table if not exists generations (
  id uuid default gen_random_uuid() primary key,
  ip text not null,
  created_at timestamp with time zone default now()
);
create index if not exists generations_ip_created_at_idx on generations (ip, created_at);

-- Listings history
create table if not exists listings (
  id uuid default gen_random_uuid() primary key,
  ip text not null,
  titre text,
  description text,
  marque text,
  categorie text,
  taille text,
  etat text,
  couleur text,
  prix_suggere integer,
  created_at timestamp with time zone default now()
);
