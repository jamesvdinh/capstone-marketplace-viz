import bioe from "../assets/bioe.jpg";
import cee from "../assets/cee.jpg";
import eecs from "../assets/eecs.jpg";
import ieor from "../assets/ieor.png";
import me from "../assets/me.jpg";
import mse from "../assets/mse.jpg";
import ne from "../assets/ne.png";

// Assigns a thumbnail URL to a project if it doesn't have one, using a predefined mapping.
const thumbnailMap: Record<string, string> = {
  bioe: bioe,
  cee: cee,
  eecs: eecs,
  ieor: ieor,
  me: me,
  mse: mse,
  ne: ne,
};

export const assignThumbnail = (ucbDept: string): string => {
  const lowerCaseDept = ucbDept.toLowerCase();
  return thumbnailMap[lowerCaseDept] ? thumbnailMap[lowerCaseDept] : "";
};
