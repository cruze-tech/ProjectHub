-- NGO Workspace Database Schema
-- Run this in your Supabase SQL Editor

-- Team Members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channels
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES team_members(id),
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  due_date DATE,
  assigned_to UUID REFERENCES team_members(id),
  milestone_id UUID REFERENCES milestones(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Row Level Security (permissive for POC)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow all operations for POC (no auth)
CREATE POLICY "Allow all" ON team_members FOR ALL USING (true);
CREATE POLICY "Allow all" ON channels FOR ALL USING (true);
CREATE POLICY "Allow all" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all" ON milestones FOR ALL USING (true);
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true);

-- Seed Data: Team Members
INSERT INTO team_members (id, name, role, avatar_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Amina Osei', 'Program Officer', null),
  ('22222222-2222-2222-2222-222222222222', 'David Mensah', 'Field Coordinator', null),
  ('33333333-3333-3333-3333-333333333333', 'Grace Achieng', 'M&E Officer', null);

-- Seed Data: Channels
INSERT INTO channels (id, name, description) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'general', 'General project discussions'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'field-updates', 'Updates from the field team'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'reports', 'Reports and documentation');

-- Seed Data: Milestones
INSERT INTO milestones (id, title, description, due_date) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Baseline Survey Complete', 'Complete initial community assessment', '2025-02-15'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Training Delivered', 'Deliver mental health awareness training', '2025-03-30'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Final Report Submitted', 'Submit final project report to donors', '2025-06-30');

-- Seed Data: Tasks
INSERT INTO tasks (title, description, status, due_date, assigned_to, milestone_id) VALUES
  ('Design survey questionnaire', 'Create baseline survey questions', 'done', '2025-01-20', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('Conduct community interviews', 'Interview 50 community members', 'in_progress', '2025-02-10', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('Analyze survey data', 'Compile and analyze survey results', 'todo', '2025-02-15', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('Prepare training materials', 'Create slides and handouts', 'in_progress', '2025-03-01', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  ('Schedule training sessions', 'Coordinate with community leaders', 'todo', '2025-03-15', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  ('Deliver training workshops', 'Conduct 3 training sessions', 'todo', '2025-03-30', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  ('Draft final report', 'Write project outcomes report', 'todo', '2025-06-15', '11111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
  ('Gather impact data', 'Collect post-intervention metrics', 'todo', '2025-06-01', '33333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff');

-- Seed Data: Messages
INSERT INTO messages (channel_id, sender_id, content, created_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Welcome to the Community Mental Wellbeing Program workspace! Let''s use this space to coordinate our activities.', NOW() - INTERVAL '7 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Thanks Amina! Excited to get started. The community leaders are very supportive.', NOW() - INTERVAL '7 days' + INTERVAL '2 hours'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'I''ve drafted the baseline survey. Will share it in #reports for review.', NOW() - INTERVAL '6 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Field visit completed in Kasoa. Met with 12 community members today.', NOW() - INTERVAL '3 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'The community health workers are eager to participate in the training.', NOW() - INTERVAL '3 days' + INTERVAL '30 minutes'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Great progress David! Please document the key contacts.', NOW() - INTERVAL '2 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Baseline survey questionnaire is ready for review. Please check and provide feedback.', NOW() - INTERVAL '5 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Reviewed the survey. Looks comprehensive. Approved!', NOW() - INTERVAL '4 days');

-- Create storage bucket for files (run separately in Supabase dashboard if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', true);
