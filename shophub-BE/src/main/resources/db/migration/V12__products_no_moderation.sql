-- Sellers list products themselves. Convert leftover moderation statuses to live listings.
UPDATE products SET status = 'active' WHERE status IN ('pending', 'rejected');
