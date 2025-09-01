-- Create enum for savings movement types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'savings_movement_type') THEN
    CREATE TYPE public.savings_movement_type AS ENUM ('deposit', 'withdraw');
  END IF;
END $$;

-- Create savings_movements table
CREATE TABLE IF NOT EXISTS public.savings_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  type public.savings_movement_type NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.savings_movements ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own savings_movements"
ON public.savings_movements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings_movements"
ON public.savings_movements FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings_movements"
ON public.savings_movements FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings_movements"
ON public.savings_movements FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_savings_movements_updated_at
BEFORE UPDATE ON public.savings_movements
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Functions to adjust balances and goal amounts on changes
CREATE OR REPLACE FUNCTION public.apply_savings_movement(movement public.savings_movements, is_reverse boolean)
RETURNS void AS $$
DECLARE
  sign integer := 1;
  amt numeric;
BEGIN
  -- Reverse means undoing a previous movement (for update/delete)
  IF is_reverse THEN
    sign := -1;
  END IF;

  amt := movement.amount;

  -- For deposit: money leaves the account and goes to the savings goal
  IF movement.type = 'deposit' THEN
    -- Decrease account balance
    UPDATE public.accounts
    SET balance = balance - (sign * amt), updated_at = now()
    WHERE id = movement.account_id AND user_id = movement.user_id;

    -- Increase goal current_amount
    UPDATE public.savings_goals
    SET current_amount = current_amount + (sign * amt)
    WHERE id = movement.goal_id AND user_id = movement.user_id;
  ELSE
    -- withdraw: money leaves the savings goal and goes back to the account
    UPDATE public.accounts
    SET balance = balance + (sign * amt), updated_at = now()
    WHERE id = movement.account_id AND user_id = movement.user_id;

    UPDATE public.savings_goals
    SET current_amount = current_amount - (sign * amt)
    WHERE id = movement.goal_id AND user_id = movement.user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public;

-- Insert trigger: apply movement
CREATE OR REPLACE FUNCTION public.tg_savings_movements_insert()
RETURNS trigger AS $$
BEGIN
  PERFORM public.apply_savings_movement(NEW, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public;

-- Update trigger: undo old then apply new
CREATE OR REPLACE FUNCTION public.tg_savings_movements_update()
RETURNS trigger AS $$
BEGIN
  PERFORM public.apply_savings_movement(OLD, true);
  PERFORM public.apply_savings_movement(NEW, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public;

-- Delete trigger: undo movement
CREATE OR REPLACE FUNCTION public.tg_savings_movements_delete()
RETURNS trigger AS $$
BEGIN
  PERFORM public.apply_savings_movement(OLD, true);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public;

-- Attach triggers
DROP TRIGGER IF EXISTS savings_movements_insert ON public.savings_movements;
CREATE TRIGGER savings_movements_insert
AFTER INSERT ON public.savings_movements
FOR EACH ROW EXECUTE FUNCTION public.tg_savings_movements_insert();

DROP TRIGGER IF EXISTS savings_movements_update ON public.savings_movements;
CREATE TRIGGER savings_movements_update
AFTER UPDATE ON public.savings_movements
FOR EACH ROW EXECUTE FUNCTION public.tg_savings_movements_update();

DROP TRIGGER IF EXISTS savings_movements_delete ON public.savings_movements;
CREATE TRIGGER savings_movements_delete
AFTER DELETE ON public.savings_movements
FOR EACH ROW EXECUTE FUNCTION public.tg_savings_movements_delete();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_savings_movements_user ON public.savings_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_movements_goal ON public.savings_movements(goal_id);
CREATE INDEX IF NOT EXISTS idx_savings_movements_date ON public.savings_movements(date);
