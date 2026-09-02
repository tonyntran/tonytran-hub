-- Allow blog_post as a content_blocks type
ALTER TABLE content_blocks DROP CONSTRAINT chk_content_blocks_type;
ALTER TABLE content_blocks ADD CONSTRAINT chk_content_blocks_type
  CHECK (type IN ('hero', 'about', 'experience', 'skill', 'project', 'contact', 'blog_post'));

-- Enforce unique slugs among blog posts
CREATE UNIQUE INDEX idx_content_blocks_blog_slug
  ON content_blocks ((metadata->>'slug'))
  WHERE type = 'blog_post';

-- Public bucket for blog cover/inline images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('blog-images', 'blog-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

CREATE POLICY "public_read_blog_images" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'blog-images');

CREATE POLICY "auth_write_blog_images" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'blog-images' AND auth.jwt()->>'email' = 'tonytran11498@gmail.com')
  WITH CHECK (bucket_id = 'blog-images' AND auth.jwt()->>'email' = 'tonytran11498@gmail.com');
