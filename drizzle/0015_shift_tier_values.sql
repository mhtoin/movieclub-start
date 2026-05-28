-- Shift tier values from 0-based to 1-based so the highest tier (S) is 1 and lowest (D) is 5.
-- Auto-generated reviews will use: stars = 6 - value
UPDATE tier SET value = value + 1;
