-- Run this SQL in your Supabase SQL Editor

-- 1. Create a unique constraint to prevent duplicate emails in a team
ALTER TABLE case_study_members ADD CONSTRAINT unique_team_email UNIQUE (team_id, email);

-- 2. Create the RPC function to handle atomic joining with row locking
CREATE OR REPLACE FUNCTION join_case_study_team(
  p_team_code TEXT,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_college TEXT,
  p_roll_number TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team_id UUID;
  v_max_members INT;
  v_is_locked BOOLEAN;
  v_current_count INT;
BEGIN
  -- Lock the team row to prevent race conditions
  SELECT id, max_members, is_locked 
  INTO v_team_id, v_max_members, v_is_locked
  FROM case_study_teams
  WHERE team_code = p_team_code
  FOR UPDATE;

  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'Invalid team code. Please check and try again.';
  END IF;

  IF v_is_locked THEN
    RAISE EXCEPTION 'This team is locked and no longer accepting members.';
  END IF;

  -- Get current member count
  SELECT COUNT(*) INTO v_current_count FROM case_study_members WHERE team_id = v_team_id;

  IF v_current_count >= COALESCE(v_max_members, 5) THEN
    RAISE EXCEPTION 'This team is already full (max % members).', COALESCE(v_max_members, 5);
  END IF;

  -- Insert the new member
  INSERT INTO case_study_members (team_id, full_name, email, phone, college, roll_number, is_lead)
  VALUES (v_team_id, p_name, p_email, p_phone, p_college, p_roll_number, false);

  RETURN v_team_id;
END;
$$;
