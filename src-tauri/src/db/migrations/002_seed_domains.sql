-- Migration 002: Seed default life domains

INSERT OR IGNORE INTO domains (id, slug, name, icon, color, vision, purpose, current_status, health_score, is_active, sort_order, created_at, updated_at) VALUES
('dom_health',        'health',        'Health',        'Heart',     'hsl(142 71% 45%)', '', '', '', 0, 1, 0,  datetime('now'), datetime('now')),
('dom_career',        'career',        'Career',        'Briefcase', 'hsl(217 91% 60%)', '', '', '', 0, 1, 1,  datetime('now'), datetime('now')),
('dom_financial',     'financial',     'Financial',     'TrendingUp','hsl(38 92% 50%)',  '', '', '', 0, 1, 2,  datetime('now'), datetime('now')),
('dom_intellectual',  'intellectual',  'Intellectual',  'BookOpen',  'hsl(258 90% 66%)', '', '', '', 0, 1, 3,  datetime('now'), datetime('now')),
('dom_emotional',     'emotional',     'Emotional',     'Smile',     'hsl(330 81% 60%)', '', '', '', 0, 1, 4,  datetime('now'), datetime('now')),
('dom_spiritual',     'spiritual',     'Spiritual',     'Compass',   'hsl(190 95% 39%)', '', '', '', 0, 1, 5,  datetime('now'), datetime('now')),
('dom_relationships', 'relationships', 'Relationships', 'Users',     'hsl(24 95% 53%)',  '', '', '', 0, 1, 6,  datetime('now'), datetime('now')),
('dom_family',        'family',        'Family',        'Home',      'hsl(84 81% 44%)',  '', '', '', 0, 1, 7,  datetime('now'), datetime('now')),
('dom_social',        'social',        'Social',        'Globe',     'hsl(270 95% 75%)', '', '', '', 0, 1, 8,  datetime('now'), datetime('now')),
('dom_character',     'character',     'Character',     'Shield',    'hsl(350 89% 60%)', '', '', '', 0, 1, 9,  datetime('now'), datetime('now')),
('dom_lifestyle',     'lifestyle',     'Lifestyle',     'Leaf',      'hsl(175 77% 40%)', '', '', '', 0, 1, 10, datetime('now'), datetime('now')),
('dom_legacy',        'legacy',        'Legacy',        'Star',      'hsl(239 84% 67%)', '', '', '', 0, 1, 11, datetime('now'), datetime('now'));
