-- ============================================================
-- TRAINEE PLATFORM — SEED DATA
-- Run AFTER schema.sql on an empty database.
-- User IDs use fixed UUIDs so chat/submission inserts can point at them.
-- Course/chapter/task IDs are auto-assigned in insert order (1, 2, 3...).
-- ============================================================

BEGIN;

-- ============================================================
-- USERS (001 = Sophat the student, 002-006 = instructors)
-- ============================================================
INSERT INTO users (id, name) VALUES
('00000000-0000-0000-0000-000000000001', 'Sophat'),
('00000000-0000-0000-0000-000000000002', 'Dara'),
('00000000-0000-0000-0000-000000000003', 'Sokha'),
('00000000-0000-0000-0000-000000000004', 'Maly'),
('00000000-0000-0000-0000-000000000005', 'Vanna'),
('00000000-0000-0000-0000-000000000006', 'Nita');

-- ============================================================
-- CATEGORIES (ids 1-8)
-- ============================================================
INSERT INTO categories (name, icon, slug) VALUES
('Web Development',   'web',       'web-development'),
('Mobile Development', 'mobile',   'mobile-development'),
('DevOps',            'devops',    'devops'),
('Cyber Security',    'cyber',     'cyber-security'),
('UI/UX Design',      'uiux',      'ui-ux-design'),
('API / Backend',     'api',       'api-backend'),
('Database',          'database',  'database'),
('Blockchain',        'blockchain','blockchain');

-- ============================================================
-- COURSES (ids 1-6) -- replace image_url with your own images
-- ============================================================
INSERT INTO courses (title, khmer_title, description, image_url, level, duration, approval_status, approved_at, created_at) VALUES
('API/Backend Developer', 'អ្នកអភិវឌ្ឍកម្មវិធីផ្នែកបច្ចេកវិទ្យា', 'API/Backend Developer is a practical program with guided lessons, hands-on homework, and support from mentors.', 'https://picsum.photos/seed/course1/640/360', 'BASIC', '1h', 'APPROVED', now(), '2026-08-08T08:00:00.000Z'),
('Frontend Developer',    'អ្នកអភិវឌ្ឍកម្មវិធីផ្នែកខាងមុខ', 'Master modern web user interfaces using Vue.js, React, Tailwind CSS, and Vite.', 'https://picsum.photos/seed/course2/640/360', 'INTERMEDIATE', '2h', 'APPROVED', now(), '2026-08-07T10:30:00.000Z'),
('JavaScript Fundamentals','មូលដ្ឋានគ្រឹះនៃភាសា JavaScript', 'Learn core JavaScript concepts, modern ES6+ features, DOM manipulation, and async programming.', 'https://picsum.photos/seed/course3/640/360', 'BASIC', '1h 30m', 'NOT_REQUESTED', NULL, '2026-08-06T06:15:00.000Z'),
('React Developer',       'អ្នកអភិវឌ្ឍកម្មវិធីជាមួយ React', 'Build interactive single-page web applications using React, Hooks, and React Router.', 'https://picsum.photos/seed/course4/640/360', 'INTERMEDIATE', '3h', 'NOT_REQUESTED', NULL, '2026-08-05T09:00:00.000Z'),
('Database Design',       'ការរចនានិងគ្រប់គ្រងមូលដ្ឋានទិន្នន័យ', 'Learn relational and NoSQL database modeling, normalization, indexing, and query optimization.', 'https://picsum.photos/seed/course5/640/360', 'ADVANCED', '2h 30m', 'REJECTED', NULL, '2026-08-04T13:20:00.000Z'),
('TypeScript for Beginners','មូលដ្ឋានគ្រឹះ TypeScript សម្រាប់អ្នកចាប់ផ្តើម', 'Gain strong static typing skills with TypeScript, interfaces, generics, and utility types.', 'https://picsum.photos/seed/course6/640/360', 'BASIC', '1h 45m', 'NOT_REQUESTED', NULL, '2026-08-03T07:45:00.000Z');

-- ============================================================
-- COURSE -> CATEGORY LINKS
-- ============================================================
INSERT INTO course_categories (course_id, category_id) VALUES
(1, 6), (2, 1), (3, 1), (4, 1), (5, 7), (6, 1);

-- ============================================================
-- COURSE -> INSTRUCTORS (Dara=002, Sokha=003, Maly=004, Vanna=005, Nita=006)
-- ============================================================
INSERT INTO course_instructors (course_id, user_id) VALUES
(1, '00000000-0000-0000-0000-000000000002'),
(1, '00000000-0000-0000-0000-000000000003'),
(1, '00000000-0000-0000-0000-000000000004'),
(1, '00000000-0000-0000-0000-000000000005'),
(1, '00000000-0000-0000-0000-000000000006'),
(2, '00000000-0000-0000-0000-000000000003'),
(2, '00000000-0000-0000-0000-000000000002'),
(3, '00000000-0000-0000-0000-000000000004'),
(3, '00000000-0000-0000-0000-000000000006'),
(3, '00000000-0000-0000-0000-000000000005'),
(4, '00000000-0000-0000-0000-000000000002'),
(4, '00000000-0000-0000-0000-000000000003'),
(4, '00000000-0000-0000-0000-000000000004'),
(4, '00000000-0000-0000-0000-000000000006'),
(5, '00000000-0000-0000-0000-000000000005'),
(5, '00000000-0000-0000-0000-000000000006'),
(6, '00000000-0000-0000-0000-000000000004');

-- ============================================================
-- COURSE SKILLS ("What you will learn")
-- ============================================================
INSERT INTO course_skills (course_id, text, position) VALUES
(1, 'យល់ដឹងពីសញ្ញាណ និង workflow សម្រាប់ API/Backend Developer', 1),
(1, 'REST API design, validation, authentication, and permissions', 2),
(1, 'Database modeling, queries, transactions, and caching', 3),
(1, 'Backend testing, documentation, deployment, and monitoring', 4),
(1, 'អនុវត្តគម្រោង និងរបៀបធ្វើការជាក្រុមសម្រាប់ API/Backend Developer', 5),
(2, 'យល់ដឹងពី Component Architecture និង State Management', 1),
(2, 'ការរចនា UI/UX ប្រកបដោយភាពទាក់ទាញជាមួយ Tailwind CSS', 2),
(2, 'ការតភ្ជាប់ Frontend ទៅកាន់ REST Endpoints ជាមួយ Axios/Fetch', 3),
(2, 'ការគ្រប់គ្រង Routing និង Navigation ក្នុង Single Page Applications', 4),
(3, 'យល់ដឹងពី Data Types, Control Structures, និង Functions', 1),
(3, 'ការប្រើប្រាស់ ES6+ Features (Arrow Functions, Destructuring, Modules)', 2),
(3, 'Asynchronous Programming (Promises, Async/Await)', 3),
(3, 'DOM Manipulation និង Event Listeners', 4),
(4, 'Mastering React Hooks (useState, useEffect, useMemo, useCallback)', 1),
(4, 'Global state management with Context API / Redux Toolkit', 2),
(4, 'Client-side routing with React Router v6', 3),
(4, 'Custom hook creation and reusable component design patterns', 4),
(5, 'Relational Database Normalization (1NF to 3NF)', 1),
(5, 'SQL Query optimization, indexing strategies, and joins', 2),
(5, 'NoSQL document modeling with MongoDB', 3),
(5, 'ACID transactions and concurrency control', 4),
(6, 'Type Annotations, Type Inference, and Union Types', 1),
(6, 'Interfaces, Type Aliases, and Object Types', 2),
(6, 'Generics and Reusable Code Structure', 3),
(6, 'TypeScript configuration and integration with React/Node', 4);

-- ============================================================
-- KEY LESSONS
-- ============================================================
INSERT INTO key_lessons (course_id, code, title, description, position) VALUES
(1, 'API', 'រចនា API', 'រៀនបង្កើត Route, DTO, Validation, Authentication, Authorization និង Response Contract.', 1),
(1, 'DB', 'Database និង Service', 'អនុវត្តការបង្កើត Table, Relation, Query, Transaction និងការរៀបចំ Service Logic.', 2),
(1, 'OPS', 'ចេញផ្សាយ Backend', 'រៀបចំ Documentation, Testing, Deployment, Monitoring និងការថែទាំ Backend.', 3),
(2, 'UI', 'Component Systems', 'ការបង្កើត Reusable Components, Props, និង State Management.', 1),
(2, 'API', 'API Fetching', 'ការទាញយកទិន្នន័យ Async/Await និង Handling Loading/Error States.', 2),
(2, 'PERF', 'Optimization', 'ការរៀបចំ Vite Build, Lazy Loading, និង Web Performance.', 3),
(3, 'BAS', 'JS Syntax & Scope', 'យល់ដឹងពី Variables (let, const), Data Types, និង Functions.', 1),
(3, 'ASY', 'Async JavaScript', 'ការប្រើប្រាស់ Promises, Fetch API, និង handling JSON data.', 2),
(4, 'HOK', 'React Hooks in Depth', 'ការប្រើប្រាស់ React built-in hooks និងការបង្កើត Custom Hooks.', 1),
(4, 'RT', 'Routing & Layouts', 'ការរៀបចំ Dynamic Routes, Protected Routes, និង Page Layouts.', 2),
(5, 'ERD', 'ER Diagram & Modeling', 'ការរចនា Entity Relationship Diagram សម្រាប់ Real-World System.', 1),
(5, 'SQL', 'Complex Queries & Indexing', 'ការសរសេរ Complex Joins, Aggregations, និង Query Indexing.', 2),
(6, 'TYP', 'Type System Core', 'យល់ដឹងពី Primitive Types, Interfaces, និង Type Aliases.', 1),
(6, 'GEN', 'Generics & Utilities', 'ការសរសេរ Flexible & Reusable code ជាមួយ Generics.', 2);

-- ============================================================
-- COURSE TECHNOLOGIES (icons from the devicon CDN)
-- ============================================================
INSERT INTO course_technologies (course_id, name, icon) VALUES
(1, 'TypeScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg'),
(1, 'Java',       'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg'),
(1, 'Spring Boot','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg'),
(1, 'Laravel',    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg'),
(1, 'PostgreSQL', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'),
(1, 'Docker',     'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg'),
(2, 'Vue.js',     'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg'),
(2, 'React',      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'),
(2, 'Tailwind CSS','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg'),
(2, 'Vite',       'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vite/vite-original.svg'),
(3, 'JavaScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'),
(3, 'HTML5',      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'),
(3, 'CSS3',       'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg'),
(4, 'React',      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'),
(4, 'TypeScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg'),
(4, 'Tailwind CSS','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg'),
(5, 'PostgreSQL', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'),
(5, 'MongoDB',    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg'),
(5, 'MySQL',      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'),
(6, 'TypeScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg'),
(6, 'Node.js',    'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg');

-- ============================================================
-- COURSE FAQs
-- ============================================================
INSERT INTO course_faqs (course_id, question, answer, position) VALUES
(1, 'តើអ្នកណាខ្លះស័ក្តិសមសម្រាប់វគ្គ API/Backend Developer?', 'សិស្ស/និស្សិត ឬ Developer ដែលចង់ពង្រឹងជំនាញផ្នែក Backend development.', 1),
(1, 'តើខ្ញុំត្រូវមានមូលដ្ឋានអ្វីខ្លះមុនរៀន?', 'មូលដ្ឋានគ្រឹះ Programming ណាមួយ (Java, PHP, JavaScript, Python) និង SQL.', 2),
(2, 'តើវគ្គនេះផ្តោតលើ Framework មួយណា?', 'ផ្តោតលើការយល់ដឹងស៊ីជម្រៅលើ Modern JavaScript Ecosystem និង React/Vue.', 1),
(3, 'តើខ្ញុំត្រូវការបទពិសោធន៍សរសេរកូដពីមុនដែរឬទេ?', 'មិនចាំបាច់ទេ! វគ្គនេះរៀបចំឡើងសម្រាប់អ្នកចាប់ផ្តើមដំបូងពីសូន្យ.', 1),
(4, 'តើវគ្គនេះប្រើប្រាស់ JavaScript ឬ TypeScript?', 'យើងនឹងប្រើប្រាស់ TypeScript សម្រាប់ការសរសេរ React code ប្រកបដោយសុវត្ថិភាព.', 1),
(5, 'តើរៀនទាំង SQL និង NoSQL ឬ?', 'បាទ! វគ្គនេះគ្របដណ្តប់ទាំង PostgreSQL (SQL) និង MongoDB (NoSQL).', 1),
(6, 'តើខ្ញុំគួររៀន JavaScript មុន ឬ TypeScript មុន?', 'គួរតែមានមូលដ្ឋាន JavaScript ខ្លះៗមុននឹងរៀន TypeScript.', 1);

-- ============================================================
-- CHAPTERS (ids 1-3, for course 1)
-- ============================================================
INSERT INTO chapters (course_id, title, position) VALUES
(1, 'Chapter 1: Getting Started', 1),
(1, 'Chapter 2: Core Concepts Deep Dive', 2),
(1, 'Chapter 3: Advanced Optimization', 3);

-- ============================================================
-- LESSONS (ids 1-7). Mux IDs stay NULL until you upload via Mux.
-- ============================================================
INSERT INTO lessons (chapter_id, title, description, type, duration, video_url, mux_asset_id, mux_playback_id, position) VALUES
(1, '1. Course Overview & Setup', NULL, 'VIDEO', '05:20', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', NULL, NULL, 1),
(1, '2. Setting up the Development Workspace', NULL, 'VIDEO', '10:15', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', NULL, NULL, 2),
(2, '3. Understanding State & Props', NULL, 'VIDEO', '12:00', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', NULL, NULL, 1),
(2, '4. Lifecycle & Effect Hooks', NULL, 'VIDEO', '08:45', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', NULL, NULL, 2),
(2, '5. State Management Best Practices', NULL, 'VIDEO', '15:00', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', NULL, NULL, 3),
(3, '6. Performance Profiling', NULL, 'VIDEO', '06:30', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4', NULL, NULL, 1),
(3, '7. Building for Production', NULL, 'VIDEO', '11:20', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', NULL, NULL, 2);

-- ============================================================
-- HOMEWORK (ids 1-2) + TASKS (ids 1-3), all for course 1
-- ============================================================
INSERT INTO homeworks (course_id, title, description) VALUES
(1, 'Homework 1: API Contract Design', 'Design the API contract for the new feature.'),
(1, 'Homework 2: Database Schema Design', 'Design the database schema for the new feature.');

INSERT INTO homework_tasks (homework_id, title, description, type, max_score, due_date) VALUES
(1, 'Define API endpoints', NULL, 'TASK', 100, '2026-08-20T23:59:59Z'),
(2, 'Identify entities and relationships', 'Determine the entities and their relationships for the feature.', 'TASK', 100, '2026-08-25T23:59:59Z'),
(2, 'Create ER diagram', 'Draw an Entity-Relationship diagram based on the identified entities and relationships.', 'TASK', 100, '2026-08-30T23:59:59Z');

-- ============================================================
-- SUBMISSIONS (Sophat = 001, instructor Dara = 002)
-- ============================================================
INSERT INTO submissions (task_id, user_id, instructor_id, status, score, submitted_at) VALUES
(1, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'GRADED', 85, '2026-08-16T09:00:00Z'),
(2, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'NOT_SUBMITTED', NULL, NULL),
(3, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'SUBMITTED', NULL, '2026-08-17T10:30:00Z');

-- ============================================================
-- SUBMISSION ATTACHMENTS (multiple files, submission 1)
-- Replace xxxx with your actual Supabase project URL.
-- ============================================================
INSERT INTO submission_attachments (submission_id, file_name, file_url, file_size) VALUES
(1, 'api-contract.pdf',     'https://xxxx.supabase.co/storage/v1/object/public/homework/1/api-contract.pdf', 204800),
(1, 'endpoint-schema.json', 'https://xxxx.supabase.co/storage/v1/object/public/homework/1/endpoint-schema.json', 5120);

-- ============================================================
-- ENROLLMENTS / FAVORITES / REVIEWS / REACTIONS (Sophat = 001)
-- ============================================================
INSERT INTO enrollments (course_id, user_id, status, progress_percentage) VALUES
(1, '00000000-0000-0000-0000-000000000001', 'APPROVED', 49);

INSERT INTO favorites (user_id, course_id) VALUES
('00000000-0000-0000-0000-000000000001', 2),
('00000000-0000-0000-0000-000000000001', 4);

INSERT INTO reviews (course_id, user_id, rating, comment) VALUES
(1, '00000000-0000-0000-0000-000000000001', 5, 'Great course, very practical!');

INSERT INTO course_reactions (course_id, user_id, type) VALUES
(1, '00000000-0000-0000-0000-000000000001', 'LIKE');

-- ============================================================
-- LESSON PROGRESS (Sophat = 001)
-- ============================================================
INSERT INTO lesson_progress (user_id, lesson_id, progress_percentage, completed_at, last_watched_at) VALUES
('00000000-0000-0000-0000-000000000001', 1, 100, now(), now()),
('00000000-0000-0000-0000-000000000001', 2, 100, now(), now()),
('00000000-0000-0000-0000-000000000001', 3, 100, now(), now()),
('00000000-0000-0000-0000-000000000001', 4, 45,  NULL,  now());

-- ============================================================
-- CHAT (thread = submission 1: Sophat <-> Dara)
-- ============================================================
INSERT INTO chat_messages (submission_id, sender_name, sender, text, sent_at) VALUES
(1, 'Dara',  'INSTRUCTOR', 'Hi! Have you started on the API contract design yet?', '2026-08-15T10:00:00Z'),
(1, 'Sophat','STUDENT',    'Yes, I finished the routes. Should I add auth on every endPoint?', '2026-08-15T10:02:00Z'),
(1, 'Dara',  'INSTRUCTOR', 'Not on every endpoint. Only the ones that require user authentication.', '2026-08-15T10:05:00Z'),
(1, 'Sophat','STUDENT',    'Got it! Thanks for the clarification.', '2026-08-15T10:07:00Z'),
(1, 'Dara',  'INSTRUCTOR', 'No problem! Let me know if you have any other questions.', '2026-08-15T10:10:00Z');

COMMIT;
