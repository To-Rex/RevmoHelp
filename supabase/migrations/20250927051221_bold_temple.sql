/*
  # Q&A System Implementation

  1. New Tables
    - `questions` - User questions with categories and tags
    - `answers` - Doctor answers to questions
    - `question_votes` - Voting system for questions
    - `answer_votes` - Voting system for answers

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own content
    - Add policies for doctors to answer questions
    - Add policies for public viewing

  3. Features
    - Question categories and tags
    - Voting system for questions and answers
    - Best answer selection
    - View tracking
    - Status management (open/answered/closed)
*/

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  slug text UNIQUE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  status text DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  views_count integer DEFAULT 0,
  votes_count integer DEFAULT 0,
  answers_count integer DEFAULT 0,
  best_answer_id uuid,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_best_answer boolean DEFAULT false,
  votes_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Question votes table
CREATE TABLE IF NOT EXISTS question_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type text CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- Answer votes table
CREATE TABLE IF NOT EXISTS answer_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid REFERENCES answers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type text CHECK (vote_type IN ('up', 'down', 'helpful')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(answer_id, user_id, vote_type)
);

-- Add foreign key for best answer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'questions_best_answer_id_fkey'
  ) THEN
    ALTER TABLE questions ADD CONSTRAINT questions_best_answer_id_fkey 
    FOREIGN KEY (best_answer_id) REFERENCES answers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_author_id ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_views_count ON questions(views_count);
CREATE INDEX IF NOT EXISTS idx_questions_votes_count ON questions(votes_count);
CREATE INDEX IF NOT EXISTS idx_questions_slug ON questions(slug);

CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON answers(author_id);
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON answers(created_at);
CREATE INDEX IF NOT EXISTS idx_answers_votes_count ON answers(votes_count);
CREATE INDEX IF NOT EXISTS idx_answers_is_best_answer ON answers(is_best_answer);

CREATE INDEX IF NOT EXISTS idx_question_votes_question_id ON question_votes(question_id);
CREATE INDEX IF NOT EXISTS idx_question_votes_user_id ON question_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_answer_votes_answer_id ON answer_votes(answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_votes_user_id ON answer_votes(user_id);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can manage all questions"
  ON questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- RLS Policies for answers
CREATE POLICY "Anyone can view answers"
  ON answers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Doctors can create answers"
  ON answers FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('doctor', 'admin', 'moderator')
    )
  );

CREATE POLICY "Users can update their own answers"
  ON answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can manage all answers"
  ON answers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- RLS Policies for question votes
CREATE POLICY "Anyone can view question votes"
  ON question_votes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can vote on questions"
  ON question_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own question votes"
  ON question_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own question votes"
  ON question_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for answer votes
CREATE POLICY "Anyone can view answer votes"
  ON answer_votes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can vote on answers"
  ON answer_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answer votes"
  ON answer_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own answer votes"
  ON answer_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Functions for updating counts
CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update answers count
  UPDATE questions 
  SET answers_count = (
    SELECT COUNT(*) FROM answers WHERE question_id = NEW.question_id
  ),
  updated_at = now()
  WHERE id = NEW.question_id;
  
  -- Update question status to 'answered' if it was 'open'
  UPDATE questions 
  SET status = 'answered'
  WHERE id = NEW.question_id AND status = 'open';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_question_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE questions 
  SET votes_count = (
    SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END), 0)
    FROM question_votes 
    WHERE question_id = COALESCE(NEW.question_id, OLD.question_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.question_id, OLD.question_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_answer_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE answers 
  SET votes_count = (
    SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END), 0)
    FROM answer_votes 
    WHERE answer_id = COALESCE(NEW.answer_id, OLD.answer_id)
  ),
  helpful_count = (
    SELECT COUNT(*)
    FROM answer_votes 
    WHERE answer_id = COALESCE(NEW.answer_id, OLD.answer_id) AND vote_type = 'helpful'
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.answer_id, OLD.answer_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_question_stats_trigger
  AFTER INSERT ON answers
  FOR EACH ROW
  EXECUTE FUNCTION update_question_stats();

CREATE TRIGGER update_question_votes_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON question_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_question_votes_count();

CREATE TRIGGER update_answer_votes_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON answer_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_answer_votes_count();

-- Update triggers for timestamps
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at
  BEFORE UPDATE ON answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO questions (title, content, slug, author_id, category_id, tags, status) VALUES
(
  'Revmatoid artrit belgilari qanday?',
  'Menda qo''llarimda og''riq va shishish bor. Bu revmatoid artrit belgisi bo''lishi mumkinmi? Qanday tekshiruvlar o''tkazish kerak?',
  'revmatoid-artrit-belgilari',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Artrit' LIMIT 1),
  ARRAY['artrit', 'belgilar', 'diagnostika'],
  'open'
),
(
  'Osteoartroz uchun qanday mashqlar foydali?',
  'Tizzalarimda osteoartroz tashxisi qo''yilgan. Qanday jismoniy mashqlar qilishim mumkin va qaysilaridan qochishim kerak?',
  'osteoartroz-mashqlar',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Artroz' LIMIT 1),
  ARRAY['artroz', 'mashqlar', 'jismoniy tarbiya'],
  'answered'
),
(
  'Revmatik kasalliklarni oldini olish mumkinmi?',
  'Oilamda revmatik kasalliklar ko''p uchraydi. Men ham xavf ostidaman. Qanday profilaktika choralari mavjud?',
  'revmatik-kasalliklar-profilaktika',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Profilaktika' LIMIT 1),
  ARRAY['profilaktika', 'genetika', 'oldini olish'],
  'open'
) ON CONFLICT (slug) DO NOTHING;