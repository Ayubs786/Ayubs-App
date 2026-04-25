-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This creates the table that stores all your daily companion entries.

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  mode text not null,
  mode_label text not null,
  input text not null,
  output text not null
);

-- Index for fast retrieval ordered by date
create index if not exists entries_created_at_idx
  on entries (created_at desc);

-- Optional: full-text search index for the search feature
create index if not exists entries_input_search_idx
  on entries using gin (to_tsvector('english', input));

create index if not exists entries_output_search_idx
  on entries using gin (to_tsvector('english', output));
