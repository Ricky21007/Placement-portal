export const calculateMatchScore = (
  userSkills: string[],
  jobSkills: string[]
): number => {
  const matched = jobSkills.filter(skill => userSkills.includes(skill));
  return Math.round((matched.length / jobSkills.length) * 100);
};
 