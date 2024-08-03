// get regex object from string
export function getRegex(regexString: string): RegExp | null {
  try {
    const trimmedRegexString = regexString.trim();

    if (
      !trimmedRegexString.startsWith("/") ||
      trimmedRegexString.split("/").length < 3
    ) {
      const escapedRegexString = trimmedRegexString.replace(
        /[.*+\-?^${}()|[\]\\]/g,
        "\\$&",
      );
      return new RegExp(escapedRegexString);
    }

    const lastSlashIndex = trimmedRegexString.lastIndexOf("/");
    const regexPattern = trimmedRegexString.slice(1, lastSlashIndex);
    const regexFlags = trimmedRegexString.slice(lastSlashIndex + 1);
    return new RegExp(regexPattern, regexFlags);
  } catch (e) {
    return null;
  }
}
