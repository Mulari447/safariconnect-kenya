create policy "Review photos readable by signed in users" on storage.objects
  for select to authenticated using (bucket_id = 'review-photos');
create policy "Users upload their own review photos" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'review-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users update their own review photos" on storage.objects
  for update to authenticated using (
    bucket_id = 'review-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users delete their own review photos" on storage.objects
  for delete to authenticated using (
    bucket_id = 'review-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );