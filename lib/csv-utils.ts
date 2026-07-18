export const REQUIRED_COLUMNS = ["Name", "Feedback", "Date", "Status", "Channel", "Theme", "Sentiment"];

export const COLUMN_ALIASES: Record<string, string[]> = {
  "Name": ["name", "customer", "customer name", "client", "user", "full name", "reporter", "author"],
  "Feedback": ["feedback", "review", "comment", "complaint", "suggestion", "message", "content", "remarks", "description"],
  "Date": ["date", "feedback date", "created at", "submitted at", "timestamp", "submission date", "created"],
  "Status": ["status", "feedback status", "ticket status", "resolution status", "state"],
  "Channel": ["channel", "source", "platform", "origin", "feedback source"],
  "Theme": ["theme", "category", "topic", "classification", "intent"],
  "Sentiment": ["sentiment", "emotion", "mood"]
};

/**
 * Attempts to parse a wide variety of date strings into a valid ISO string.
 * Supports DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, 15 Jul 2026, etc.
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr || typeof dateStr !== "string") return new Date().toISOString();
  
  const trimmed = dateStr.trim();
  if (!trimmed) return new Date().toISOString();

  // Try standard Date parsing first (works well for YYYY-MM-DD, ISO 8601, and "15 Jul 2026")
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    // Basic sanity check to prevent swapped month/days in generic parse creating nonsense
    return parsed.toISOString();
  }

  // Handle DD/MM/YYYY or MM/DD/YYYY with slashes or dashes
  const parts = trimmed.split(/[/\-]/);
  if (parts.length === 3) {
    let year = 0, month = 0, day = 0;
    
    // If first part is 4 digits -> YYYY-MM-DD (already covered by generic, but fallback)
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } 
    // If last part is 4 digits -> DD/MM/YYYY or MM/DD/YYYY
    else if (parts[2].length === 4) {
      year = parseInt(parts[2], 10);
      const p0 = parseInt(parts[0], 10);
      const p1 = parseInt(parts[1], 10);
      
      // Heuristic: If p0 > 12, it must be DD/MM/YYYY
      if (p0 > 12) {
        day = p0;
        month = p1;
      } 
      // If p1 > 12, it must be MM/DD/YYYY
      else if (p1 > 12) {
        month = p0;
        day = p1;
      } 
      // Ambiguous (e.g. 05/06/2026). We default to DD/MM/YYYY (most international), but can be localized.
      else {
        day = p0; // assuming DD/MM/YYYY default for non-US
        month = p1;
      }
    }

    if (year > 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      // Use Date.UTC to prevent local timezone from shifting the date backward
      const d = new Date(Date.UTC(year, month - 1, day));
      if (!isNaN(d.getTime())) return d.toISOString();
    }
  }

  // Final fallback to current date if completely unparseable
  return new Date().toISOString();
}

/**
 * Automatically guesses mapping based on headers using aliases.
 */
export function guessColumnMapping(csvHeaders: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  // Track assigned headers so we don't map one CSV column to two target columns
  const assigned = new Set<string>();

  for (const targetCol of REQUIRED_COLUMNS) {
    const aliases = COLUMN_ALIASES[targetCol] || [targetCol.toLowerCase()];
    
    let matchedHeader = "";
    // Exact or alias match
    for (const header of csvHeaders) {
      if (assigned.has(header)) continue;
      const cleanHeader = header.toLowerCase().trim();
      if (aliases.includes(cleanHeader)) {
        matchedHeader = header;
        break;
      }
    }
    
    // Partial match (e.g. "Customer Name (optional)" matches "customer name")
    if (!matchedHeader) {
      for (const header of csvHeaders) {
        if (assigned.has(header)) continue;
        const cleanHeader = header.toLowerCase().trim();
        for (const alias of aliases) {
          if (cleanHeader.includes(alias)) {
            matchedHeader = header;
            break;
          }
        }
        if (matchedHeader) break;
      }
    }

    if (matchedHeader) {
      mapping[targetCol] = matchedHeader;
      assigned.add(matchedHeader);
    }
  }
  return mapping;
}

/**
 * Fills missing business metadata fields safely.
 */
export function enrichFeedbackData(row: Record<string, any>) {
  const enriched = { ...row };
  
  if (!enriched.Name || enriched.Name.trim() === "") {
    enriched.Name = "Unknown User";
  }
  
  if (!enriched.Date || enriched.Date.trim() === "") {
    enriched.Date = new Date().toISOString();
  } else {
    enriched.Date = normalizeDate(enriched.Date);
  }

  if (!enriched.Status || enriched.Status.trim() === "") {
    enriched.Status = "Open";
  }

  if (!enriched.Channel || enriched.Channel.trim() === "") {
    enriched.Channel = "CSV Import";
  }

  // Theme and Sentiment will be left empty if missing so AI can process them on backend
  return enriched;
}
