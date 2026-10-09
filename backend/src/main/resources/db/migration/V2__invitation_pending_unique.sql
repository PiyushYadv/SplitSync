-- The V1 constraint UNIQUE (group_id, invited_user, status) allowed only one declined/accepted invitation
-- per user and group, so re-inviting someone who had declined or left would fail on the second decline/accept.
-- Only one *pending* invitation per user and group is the actual rule.
ALTER TABLE invitations DROP CONSTRAINT uq_group_user_invitation;

CREATE UNIQUE INDEX uq_pending_invitation ON invitations (group_id, invited_user) WHERE status = 'pending';
