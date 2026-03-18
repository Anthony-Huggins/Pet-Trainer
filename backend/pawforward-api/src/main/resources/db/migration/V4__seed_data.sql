-- =============================================
-- PawForward Academy - Seed Data
-- =============================================
-- Admin: admin@pawforward.com / admin123
-- Trainers: emily.chen@pawforward.com / trainer123
--           marcus.rivera@pawforward.com / trainer123
--           sophie.laurent@pawforward.com / trainer123
-- Client:  demo@pawforward.com / demo123

-- === USERS ===

-- Admin user
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, email_verified, enabled)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@pawforward.com',
    '$2b$12$LVDx1zuRR/ZB/W9T1S0Pa..Re0I4PaGD65qAtFm74GuvqCZmWC1yS',
    'Admin', 'PawForward', '(555) 000-0001', 'ADMIN', true, true
);

-- Trainer users
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, email_verified, enabled)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'emily.chen@pawforward.com',
     '$2b$12$LVDx1zuRR/ZB/W9T1S0Pa..Re0I4PaGD65qAtFm74GuvqCZmWC1yS',
     'Emily', 'Chen', '(555) 100-0001', 'TRAINER', true, true),
    ('b0000000-0000-0000-0000-000000000002', 'marcus.rivera@pawforward.com',
     '$2b$12$LVDx1zuRR/ZB/W9T1S0Pa..Re0I4PaGD65qAtFm74GuvqCZmWC1yS',
     'Marcus', 'Rivera', '(555) 100-0002', 'TRAINER', true, true),
    ('b0000000-0000-0000-0000-000000000003', 'sophie.laurent@pawforward.com',
     '$2b$12$LVDx1zuRR/ZB/W9T1S0Pa..Re0I4PaGD65qAtFm74GuvqCZmWC1yS',
     'Sophie', 'Laurent', '(555) 100-0003', 'TRAINER', true, true);

-- Demo client user
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, email_verified, enabled)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'demo@pawforward.com',
    '$2b$12$LVDx1zuRR/ZB/W9T1S0Pa..Re0I4PaGD65qAtFm74GuvqCZmWC1yS',
    'Demo', 'Client', '(555) 200-0001', 'CLIENT', true, true
);

-- === TRAINER PROFILES ===

INSERT INTO trainer_profiles (id, user_id, bio, specializations, certifications, years_experience, hourly_rate, is_accepting_clients)
VALUES
    ('d0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001',
     'Dr. Emily Chen is a certified professional dog trainer with over 12 years of experience in positive-reinforcement training. She specializes in behavior modification and puppy development, and holds a doctorate in Animal Behavior from Cornell University. Emily believes every dog can learn when given patience, consistency, and the right motivation.',
     ARRAY['Behavior Modification', 'Puppy Training', 'Obedience', 'Separation Anxiety'],
     ARRAY['CPDT-KA', 'CAAB', 'AKC CGC Evaluator'],
     12, 95.00, true),

    ('d0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000002',
     'Marcus Rivera brings 8 years of hands-on experience in agility, sport training, and advanced obedience. A former competitive agility handler, Marcus focuses on building strong handler-dog partnerships through clear communication and fun, high-energy sessions. He is passionate about helping dogs channel their energy productively.',
     ARRAY['Agility', 'Sport Training', 'Advanced Obedience', 'Rally'],
     ARRAY['CPDT-KA', 'CCDT', 'AKC Agility Judge'],
     8, 85.00, true),

    ('d0000000-0000-0000-0000-000000000003',
     'b0000000-0000-0000-0000-000000000003',
     'Sophie Laurent is a dedicated trainer specializing in puppy socialization and foundational obedience. With 5 years of experience, Sophie creates welcoming, low-stress environments where puppies and first-time owners can build confidence together. She is a certified Fear Free professional committed to making training a positive experience for every dog.',
     ARRAY['Puppy Socialization', 'Basic Obedience', 'Leash Manners', 'Fearful Dogs'],
     ARRAY['CPDT-KA', 'Fear Free Certified Professional'],
     5, 75.00, true);

-- === TRAINER AVAILABILITY ===
-- Emily: Mon-Fri 9am-5pm
INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time, is_recurring, is_available)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 1, '09:00', '17:00', true, true),
    ('d0000000-0000-0000-0000-000000000001', 2, '09:00', '17:00', true, true),
    ('d0000000-0000-0000-0000-000000000001', 3, '09:00', '17:00', true, true),
    ('d0000000-0000-0000-0000-000000000001', 4, '09:00', '17:00', true, true),
    ('d0000000-0000-0000-0000-000000000001', 5, '09:00', '17:00', true, true);

-- Marcus: Mon-Wed-Fri 10am-6pm, Sat 9am-1pm
INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time, is_recurring, is_available)
VALUES
    ('d0000000-0000-0000-0000-000000000002', 1, '10:00', '18:00', true, true),
    ('d0000000-0000-0000-0000-000000000002', 3, '10:00', '18:00', true, true),
    ('d0000000-0000-0000-0000-000000000002', 5, '10:00', '18:00', true, true),
    ('d0000000-0000-0000-0000-000000000002', 6, '09:00', '13:00', true, true);

-- Sophie: Tue-Thu 9am-3pm, Sat 10am-2pm
INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time, is_recurring, is_available)
VALUES
    ('d0000000-0000-0000-0000-000000000003', 2, '09:00', '15:00', true, true),
    ('d0000000-0000-0000-0000-000000000003', 4, '09:00', '15:00', true, true),
    ('d0000000-0000-0000-0000-000000000003', 6, '10:00', '14:00', true, true);

-- === SERVICES ===

-- Private Sessions
INSERT INTO service_types (id, name, category, description, duration_minutes, max_participants, price, is_active, sort_order)
VALUES
    ('e0000000-0000-0000-0000-000000000001',
     'Private Training Session',
     'PRIVATE',
     'One-on-one training tailored to your dog''s specific needs. Our certified trainers work directly with you and your dog to address behavioral issues, build obedience skills, or refine advanced commands. Each session includes a personalized training plan and homework exercises to practice between visits.',
     60, 1, 95.00, true, 1),

    ('e0000000-0000-0000-0000-000000000002',
     'Puppy Starter Session',
     'PRIVATE',
     'A focused introductory session designed for puppies under 6 months. We cover essential foundations like name recognition, sit, stay, come, and crate training. This session also addresses common puppy challenges like nipping, jumping, and potty training basics.',
     45, 1, 75.00, true, 2),

    ('e0000000-0000-0000-0000-000000000003',
     'Behavior Consultation',
     'PRIVATE',
     'An in-depth assessment for dogs with specific behavioral challenges such as aggression, anxiety, excessive barking, or destructive behaviors. Our behaviorist evaluates triggers and creates a comprehensive modification plan. Includes a written behavior report and follow-up recommendations.',
     90, 1, 150.00, true, 3);

-- Group Classes
INSERT INTO service_types (id, name, category, description, duration_minutes, max_participants, price, is_active, sort_order)
VALUES
    ('e0000000-0000-0000-0000-000000000004',
     'Group Obedience Class',
     'GROUP_CLASS',
     'A 6-week course covering essential obedience commands in a supportive group environment. Your dog will learn sit, down, stay, come, loose-leash walking, and leave it, all while practicing around real-world distractions. Great for building social skills alongside foundational training.',
     60, 8, 45.00, true, 4),

    ('e0000000-0000-0000-0000-000000000005',
     'Puppy Socialization Class',
     'GROUP_CLASS',
     'A fun, structured class for puppies aged 8-16 weeks to develop confidence and social skills in a safe environment. Puppies practice polite greetings, gentle play, and basic manners while being exposed to new sights, sounds, and surfaces. Vaccination requirements apply.',
     45, 10, 35.00, true, 5),

    ('e0000000-0000-0000-0000-000000000006',
     'Advanced Obedience & Rally',
     'GROUP_CLASS',
     'For dogs that have mastered basic obedience, this class builds on core skills with advanced commands, off-leash reliability, and an introduction to AKC Rally exercises. Ideal preparation for the Canine Good Citizen test or competitive rally.',
     60, 6, 55.00, true, 6),

    ('e0000000-0000-0000-0000-000000000007',
     'Agility Foundations',
     'GROUP_CLASS',
     'An exciting introduction to the sport of agility. Dogs learn to navigate tunnels, jumps, weave poles, and the A-frame at their own pace. This class builds confidence, fitness, and handler-dog teamwork. Open to dogs of all sizes over 1 year of age.',
     75, 6, 60.00, true, 7);

-- Board & Train Programs
INSERT INTO service_types (id, name, category, description, duration_minutes, max_participants, price, deposit_amount, is_active, sort_order)
VALUES
    ('e0000000-0000-0000-0000-000000000008',
     '2-Week Board & Train',
     'BOARD_AND_TRAIN',
     'Our most popular immersive program. Your dog stays with one of our certified trainers for two full weeks of intensive, daily training. Includes obedience foundations, leash manners, and socialization. You''ll receive daily photo and video updates, a graduation session to transfer skills, and a personalized homework plan.',
     NULL, 3, 1800.00, 500.00, true, 8),

    ('e0000000-0000-0000-0000-000000000009',
     '4-Week Board & Train',
     'BOARD_AND_TRAIN',
     'Our comprehensive program for dogs needing more intensive work. Four weeks of daily training addresses complex behavioral challenges alongside obedience. Includes behavior modification, advanced commands, and real-world proofing in public settings. Daily updates, two transition sessions, and lifetime homework support included.',
     NULL, 2, 3200.00, 800.00, true, 9);

-- === PACKAGES ===

INSERT INTO packages (id, name, description, session_count, price, per_session_price, valid_days, service_type_id, is_active)
VALUES
    ('f0000000-0000-0000-0000-000000000001',
     '5-Session Private Training Bundle',
     'Save 10% when you purchase 5 private training sessions upfront. Flexible scheduling with any trainer.',
     5, 427.50, 85.50, 90,
     'e0000000-0000-0000-0000-000000000001', true),

    ('f0000000-0000-0000-0000-000000000002',
     '10-Session Private Training Bundle',
     'Our best value — save 15% on 10 private training sessions. Ideal for dogs on a longer training journey.',
     10, 807.50, 80.75, 180,
     'e0000000-0000-0000-0000-000000000001', true);

-- === SAMPLE REVIEWS ===

INSERT INTO reviews (id, client_id, trainer_id, service_type_id, rating, title, body, is_featured, is_approved)
VALUES
    ('11111111-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'd0000000-0000-0000-0000-000000000001',
     'e0000000-0000-0000-0000-000000000001',
     5, 'Life-changing for our reactive dog',
     'After just 4 sessions with Dr. Chen, our German Shepherd went from lunging at every dog on walks to calmly passing by. Emily''s patience and expertise made all the difference. We finally enjoy walks again!',
     true, true),

    ('11111111-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000001',
     'd0000000-0000-0000-0000-000000000002',
     'e0000000-0000-0000-0000-000000000007',
     5, 'Our dog loves agility class!',
     'Marcus makes every class so fun. Our Border Collie can''t wait to get to training each week. The agility foundations course was the perfect balance of challenge and encouragement. Highly recommend!',
     true, true),

    ('11111111-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000001',
     'd0000000-0000-0000-0000-000000000003',
     'e0000000-0000-0000-0000-000000000005',
     5, 'Best puppy class in the area',
     'Sophie''s puppy socialization class was exactly what our anxious Lab puppy needed. The environment felt safe and structured, and we could see our pup gaining confidence week after week. Worth every penny!',
     true, true),

    ('11111111-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000001',
     'd0000000-0000-0000-0000-000000000001',
     'e0000000-0000-0000-0000-000000000008',
     4, 'Great board and train experience',
     'We were nervous about leaving our dog for two weeks, but the daily photo updates put our minds at ease. He came back a different dog — so well-mannered! The graduation session was really helpful for learning the commands too.',
     false, true);
