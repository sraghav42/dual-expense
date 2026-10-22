-- Explicit display ordering; keeps 'Other' last in category pickers
ALTER TABLE categories ADD COLUMN display_order INTEGER;

-- Remove the Subscriptions category (no expenses reference it)
DELETE FROM categories WHERE name = 'Subscriptions';

-- V1 seeds ids 1-6 in the desired order, so surviving categories keep their id;
-- only 'Other' (id 8) moves to the end to leave room for the two new categories
UPDATE categories SET display_order = CASE WHEN name = 'Other' THEN 9 ELSE id END;

-- Add the two new categories between Entertainment and Other
INSERT INTO categories (name, icon_identifier, display_order) VALUES
    ('Health/Beauty', 'spa', 7),
    ('Clothing', 'checkroom', 8);

ALTER TABLE categories ALTER COLUMN display_order SET NOT NULL;
