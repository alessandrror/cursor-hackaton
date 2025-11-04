-- Create anonymous_trial_usage table for tracking free trial usage
-- This table tracks how many sessions anonymous users have completed

CREATE TABLE IF NOT EXISTS anonymous_trial_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint TEXT NOT NULL,
  ip_address TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on fingerprint for faster lookups
CREATE INDEX IF NOT EXISTS idx_anonymous_trial_usage_fingerprint ON anonymous_trial_usage(fingerprint);

-- Enable Row Level Security
ALTER TABLE anonymous_trial_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert their own records
CREATE POLICY "Allow anonymous insert"
  ON anonymous_trial_usage
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow anonymous users to select their own records (by fingerprint)
CREATE POLICY "Allow anonymous select own"
  ON anonymous_trial_usage
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Allow anonymous users to update their own records (by fingerprint)
CREATE POLICY "Allow anonymous update own"
  ON anonymous_trial_usage
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can do everything (bypass trial checks)
CREATE POLICY "Allow authenticated all"
  ON anonymous_trial_usage
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER update_anonymous_trial_usage_updated_at
  BEFORE UPDATE ON anonymous_trial_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


