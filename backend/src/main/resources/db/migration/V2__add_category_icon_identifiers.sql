ALTER TABLE categories
    ADD COLUMN icon_identifier VARCHAR(50);

UPDATE categories
SET icon_identifier = CASE name
    WHEN 'Groceries' THEN 'shopping-basket'
    WHEN 'Housing/Rent' THEN 'house'
    WHEN 'Utilities' THEN 'zap'
    WHEN 'Dining' THEN 'utensils'
    WHEN 'Transport' THEN 'car'
    WHEN 'Entertainment' THEN 'popcorn'
    WHEN 'Subscriptions' THEN 'repeat'
    WHEN 'Other' THEN 'ellipsis'
END;

ALTER TABLE categories
    ALTER COLUMN icon_identifier SET NOT NULL;
