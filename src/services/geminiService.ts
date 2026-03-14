import { GoogleGenAI } from "@google/genai";
import * as XLSX from 'xlsx';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export type AuditType = 'general' | 'consultant' | 'problems' | 'plans' | 'volumes' | 'chat';

interface AuditOptions {
  type: AuditType;
  module?: string;
  directions?: string[];
  selectedDirectionsWithCounts?: { label: string, count: number }[];
  specialQuestion?: string;
  projectName?: string;
  projectType?: string;
  additionalInfo?: string;
  history?: { role: 'user' | 'assistant', content: string }[];
}

async function excelToText(file: File): Promise<string> {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    let fullText = "";
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      fullText += `\nSHEET: ${sheetName}\n${csv}\n`;
    });
    
    return fullText;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    return `[Error parsing Excel file ${file.name}]`;
  }
}

export async function performAIAction(
  options: AuditOptions,
  normativeFiles: File[],
  projectFiles: File[],
  volumeFiles?: { estimate?: File, actual?: File }
) {
  const model = "gemini-2.5-flash";

  let systemInstruction = `Role: Hardcore Technical Textbook Publisher.
You are a top-tier technical layout designer and engineer with 20 years of experience in building codes and standards.

## 1. ABSOLUTE PROHIBITIONS (Zero Tolerance)
- NEVER use the $ (dollar sign) symbol for mathematical formatting.
- NEVER use backslashes (\\) or any LaTeX commands (e.g., \\approx, \\cdot, \\frac, \\text).
- NEVER use italics for variables or technical terms.

## 2. ALLOWED FORMATTING (Plain Text & Unicode Only)
- Use ONLY standard Unicode symbols available in basic text editors:
  - Approximation: ≈
  - Multiplication: ×
  - Superscripts: ², ³ (e.g., m³, cm²)
  - Equations: =
- Write all units in English as plain text (m³, kW, Pa, l/s).
- Round all numbers to EXACTLY 2 decimal places (e.g., 1.18, not 1.178).

## 3. VISUAL STRUCTURE (Textbook Style)
- NEVER use Markdown tables. All data, parameters, and comparisons MUST be presented in a clean, line-by-line list format.
- Use **bold text** extensively for emphasis on important parameters, headings, subheadings, and key concepts to make them stand out.
- Use proper markdown lists (e.g. `- ` or `* `) and ensure there are empty lines before and after lists for correct rendering.
- Use ## and ### for headers.
- Use horizontal lines (---) between major sections.
- The tone must be professional, descriptive, and educational, like a high-end engineering manual.

Project Metadata:
Project Name: ${options.projectName || 'Not specified'}
Type: ${options.projectType || 'Not specified'}
Additional Info: ${options.additionalInfo || 'Not specified'}`;

  switch (options.type) {
    case 'general':
      const directionsList = options.selectedDirectionsWithCounts
        ? options.selectedDirectionsWithCounts.map(d => `- ${d.label}: mandatory find EXACTLY ${d.count} problems`).join('\n')
        : options.directions?.join(', ');

      systemInstruction += `\n\nTASK: Perform a complete audit of the project EXCLUSIVELY in the following directions and quantities:
${directionsList}

STRICT RULES:
1. Do not go beyond the scope of the selected directions.
2. For each direction, you must present the specified number of problems (if they actually exist).
3. If the number of problems in any direction is less than specified, list only the real ones, but do not invent.
4. The response must be strictly professional and based only on the attached documents.

Special Question: ${options.specialQuestion || 'None'}

RESPONSE FORMAT:
Make sure to add blank lines between each problem and between each bullet point to ensure beautiful, spaced out formatting.

### **Problem №[number]**
- **Description:** (What is wrong)
- **Location:** [File], page [X]
- **Normative Basis:** [Clause], page [Y]
- **Quote:** "..."
- **Conclusion:** (Justification)
---`;
      break;

    case 'consultant':
      systemInstruction += `\n\nTASK: Act as an engineer-consultant. Perform complex calculations and provide technical clarifications.
Present calculations in a professional mathematical format (LaTeX or clear formatting).`;
      break;

    case 'problems':
      systemInstruction += `\n\nTASK: Focus on the most risky and critical problems of the project. 
Directions: ${options.directions?.join(', ')}
Special Request: ${options.specialQuestion}`;
      break;

    case 'plans':
      systemInstruction += `\n\nTASK: Perform graphical analysis. Examine floor plans, sections, and details. Look for ergonomic, normative, or functional problems.`;
      break;

    case 'volumes':
      systemInstruction += `\n\nTASK: Compare estimated volumes with actual construction acts.
      
      IMPORTANT: The response must be ONLY in JSON format for the data part, but follow the narrative textbook style for the description.
      
      JSON schema for the data part (must be valid JSON):
      {
        "table": [
          {
            "name": "Work Name",
            "unit": "m3",
            "estimateQty": 120.00,
            "actualQty": 120.00,
            "deviation": 0.00,
            "unitPrice": 2500.00,
            "totalPrice": 300000.00,
            "status": "success" | "warning" | "info"
          }
        ],
        "summary": {
          "totalEstimate": 8700000.00,
          "totalActual": 8070000.00,
          "completionPercentage": 92.80,
          "deviations": [
            "Analytical description of deviations..."
          ]
        }
      }`;
      break;

    case 'chat':
      systemInstruction += `\n\nTASK: You are an AI assistant familiar with the entire context of the project. Answer user questions based on the attached files.`;
      break;
  }

  const fileToPart = async (file: File) => {
    // Check if it's an Excel file
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv') || file.type.includes('spreadsheet') || file.type.includes('excel');
    
    if (isExcel) {
      const text = await excelToText(file);
      return { text: `FILE CONTENT (${file.name}):\n${text}` };
    }

    // For PDF and other supported formats, use inlineData
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({
          inlineData: {
            data: base64,
            mimeType: file.type || "application/pdf",
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const parts: any[] = [];
  
  for (const file of normativeFiles) {
    parts.push({ text: `NORMATIVE BASIS: ${file.name}` });
    parts.push(await fileToPart(file));
  }

  for (const file of projectFiles) {
    parts.push({ text: `PROJECT FILE: ${file.name}` });
    parts.push(await fileToPart(file));
  }

  if (volumeFiles?.estimate) {
    parts.push({ text: `ESTIMATE: ${volumeFiles.estimate.name}` });
    parts.push(await fileToPart(volumeFiles.estimate));
  }
  if (volumeFiles?.actual) {
    parts.push({ text: `ACTUAL EXECUTION: ${volumeFiles.actual.name}` });
    parts.push(await fileToPart(volumeFiles.actual));
  }

  if (options.history) {
    options.history.forEach(msg => {
      parts.push({ text: `${msg.role === 'user' ? 'USER' : 'AI'}: ${msg.content}` });
    });
  }

  parts.push({ text: options.specialQuestion || "Start work:" });

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts }],
    config: {
      systemInstruction,
      temperature: 0.1,
    },
  });

  return response.text;
}
