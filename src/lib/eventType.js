// Team events use the case-study team flow (create / join team).
// Solo events register directly. Falls back to the title check for
// events created before the registration_type column existed.
export function isTeamEvent(event) {
  if (!event) return false;
  if (event.registration_type) return event.registration_type === 'team';
  return !!event.title?.toLowerCase().includes('case study');
}
