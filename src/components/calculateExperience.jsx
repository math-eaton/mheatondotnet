
import { ToWords } from 'to-words';

export default function CalculateExperience({ startYear = 2016 }) {
  const currentYear = new Date().getFullYear();
  const experienceYears = currentYear - startYear;
  const experienceText = new ToWords().convert(experienceYears);
  const toTitleCase = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  return <>{toTitleCase(experienceText)}</>;
}
