/*
  # Notifications table yaratish

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `title` (text, notification sarlavhasi)
      - `message` (text, notification matni)
      - `type` (text, notification turi: info, success, warning, error)
      - `recipient_id` (uuid, qabul qiluvchi foydalanuvchi ID, null bo'lsa ommaviy)
      - `sender_id` (uuid, yuboruvchi admin ID)
      - `read` (boolean, o'qilgan/o'qilmagan)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `notifications` table
    - Add policy for users to read their own notifications
    - Add policy for admins to manage all notifications

  3. Indexes
    - Index on recipient_id for fast user notification queries
    - Index on read status for unread count queries
    - Index on created_at for chronological ordering
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT notifications_type_check CHECK (type IN ('info', 'success', 'warning', 'error'))
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- RLS Policies

-- Users can read their own notifications and broadcast notifications
CREATE POLICY "Users can read their notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    recipient_id = auth.uid() OR 
    recipient_id IS NULL
  );

-- Users can mark their own notifications as read
CREATE POLICY "Users can update their notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_notifications_updated_at'
  ) THEN
    CREATE TRIGGER update_notifications_updated_at
      BEFORE UPDATE ON notifications
      FOR EACH ROW
      EXECUTE FUNCTION update_notifications_updated_at();
  END IF;
END $$;

-- Insert some sample notifications for demo
INSERT INTO notifications (title, message, type, recipient_id, sender_id) VALUES
  ('Platformaga xush kelibsiz!', 'Revmoinfo platformasiga muvaffaqiyatli ro''yxatdan o''tdingiz. Professional tibbiy ma''lumotlar va shifokor maslahatlari sizni kutmoqda.', 'success', NULL, (SELECT id FROM auth.users LIMIT 1)),
  ('Yangi maqola nashr etildi', 'Revmatoid artrit haqida yangi maqola nashr etildi. O''qib chiqing va foydali ma''lumotlar oling!', 'info', NULL, (SELECT id FROM auth.users LIMIT 1)),
  ('Tizim yangilanishi', 'Platformamizda yangi xususiyatlar qo''shildi. Yangi imkoniyatlar bilan tanishing!', 'info', NULL, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;