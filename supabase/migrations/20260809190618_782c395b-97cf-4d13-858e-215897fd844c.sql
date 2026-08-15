CREATE POLICY "Owners upload company media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'company-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners update company media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'company-media' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'company-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners delete company media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'company-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Signed in users view company media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'company-media');